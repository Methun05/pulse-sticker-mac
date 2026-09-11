import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/dodo';
import { db, ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verify webhook signature
  let payload: Record<string, unknown>;
  try {
    payload = verifyWebhook(body, headers) as Record<string, unknown>;
  } catch (err) {
    console.error('[DoDo webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = payload.event_type as string;

  // Only handle payment.succeeded — failed/cancelled bids expire naturally after 30min
  if (eventType !== 'payment.succeeded') {
    console.log(`[DoDo webhook] Ignoring event: ${eventType}`);
    return NextResponse.json({ received: true });
  }

  const data = payload.data as Record<string, unknown>;
  const metadata = data?.metadata as Record<string, string> | undefined;
  const bidId = metadata?.bidId;
  const dodoPaymentId = data?.payment_id as string | undefined;

  if (!bidId) {
    console.error('[DoDo webhook] Missing bidId in metadata');
    return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
  }

  await ensureDatabase();

  const result = await db.$transaction(async (tx) => {
    const bid = await tx.bid.findUnique({
      where: { id: bidId },
      include: { spot: { include: { board: true } } },
    });

    if (!bid) {
      return { error: 'Bid not found', status: 404 } as const;
    }

    // Idempotent: already confirmed
    if (bid.status === 'CONFIRMED') {
      return { alreadyConfirmed: true } as const;
    }

    if (bid.status !== 'AWAITING_PAYMENT') {
      console.warn(`[DoDo webhook] Rejecting invalid bid status: ${bidId} (status: ${bid.status})`);
      return { error: 'Bid is no longer valid', status: 400 } as const;
    }

    // Reject expired bids (30-minute window safety net)
    const ageMs = Date.now() - new Date(bid.createdAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      console.warn(`[DoDo webhook] Bid expired: ${bidId} (age ${Math.round(ageMs / 60000)}min)`);
      return { error: 'Bid has expired', status: 400 } as const;
    }

    // Guard: reject if someone already outbid this amount
    if (bid.spot.currentBid > 0 && bid.amount <= bid.spot.currentBid) {
      console.warn(
        `[DoDo webhook] Rejecting bid ${bid.id}: amount $${bid.amount} <= current $${bid.spot.currentBid} on Spot #${bid.spot.number}`
      );
      return { error: 'Outbid by a higher bid', status: 409 } as const;
    }

    // Create Payment record (chainId=0 for fiat, token=FIAT)
    await tx.payment.create({
      data: {
        bidId: bid.id,
        txHash: dodoPaymentId || `dodo_${bid.id}`,
        chainId: 0,
        token: 'FIAT',
        tokenAmount: String(bid.amount),
        usdAmount: bid.amount,
        depositAddress: '',
        walletAddress: '',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Mark previous CONFIRMED bids on same spot → OUTBID
    await tx.bid.updateMany({
      where: {
        spotId: bid.spotId,
        id: { not: bid.id },
        status: 'CONFIRMED',
      },
      data: { status: 'OUTBID' },
    });

    // Confirm this bid
    await tx.bid.update({
      where: { id: bid.id },
      data: { status: 'CONFIRMED' },
    });

    // Update spot with new highest bidder
    await tx.spot.update({
      where: { id: bid.spotId },
      data: {
        currentBid: bid.amount,
        currentBrandName: bid.brandName,
        currentLogoUrl: bid.logoUrl,
        currentWebsite: bid.website,
        currentEmail: bid.email,
        currentXHandle: bid.xHandle,
        currentWallet: '',
        status: 'OCCUPIED',
        bidCount: { increment: 1 },
      },
    });

    // Recalculate total raised
    const allSpots = await tx.spot.findMany({
      where: { boardId: bid.spot.boardId },
    });
    const totalRaised = allSpots.reduce((sum, s) => sum + Math.max(s.currentBid, 0), 0);

    await tx.board.update({
      where: { id: bid.spot.boardId },
      data: { totalRaised },
    });

    return {
      confirmed: true,
      spotNumber: bid.spot.number,
      brandName: bid.brandName,
      amount: bid.amount,
    } as const;
  });

  if ('error' in result) {
    console.error(`[DoDo webhook] ${result.error}: ${bidId}`);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if ('alreadyConfirmed' in result) {
    return NextResponse.json({ received: true });
  }

  console.log(
    `[DoDo webhook] Confirmed: Spot #${result.spotNumber} → ${result.brandName} at $${result.amount} (fiat via DoDo, payment: ${dodoPaymentId})`
  );

  return NextResponse.json({ received: true });
}
