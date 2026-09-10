import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest, signResponse } from '@/lib/depay';
import { db, ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * DePay calls this on successful payment confirmation.
 * We update Bid → CONFIRMED, Spot, Board in an atomic transaction.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(body);
  const { blockchain, transaction, sender, token, amount, payload: callbackPayload } = data;
  const bidId = callbackPayload?.bidId;

  if (!bidId) {
    console.error('[DePay callback] Missing bidId in payload');
    return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
  }

  await ensureDatabase();

  // Map DePay blockchain name to chainId
  const CHAIN_IDS: Record<string, number> = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    base: 8453,
  };
  const chainId = CHAIN_IDS[blockchain] || 0;

  const result = await db.$transaction(async (tx) => {
    // Fetch bid inside transaction for serializable read
    const bid = await tx.bid.findUnique({
      where: { id: bidId },
      include: { spot: { include: { board: true } } },
    });

    if (!bid) {
      return { error: 'Bid not found', status: 404 } as const;
    }

    // Idempotent: if already confirmed, return success
    if (bid.status === 'CONFIRMED') {
      return { alreadyConfirmed: true } as const;
    }

    // Guard: reject if bid is no longer in a valid state (EXPIRED, CANCELLED, etc.)
    if (bid.status !== 'AWAITING_PAYMENT' && bid.status !== 'CONFIRMED') {
      console.warn(`[DePay callback] Rejecting invalid bid status: ${bidId} (status: ${bid.status})`);
      return { error: 'Bid is no longer valid', status: 400 } as const;
    }

    // Reject expired bids (30-minute window safety net)
    const ageMs = Date.now() - new Date(bid.createdAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      console.warn(`[DePay callback] Bid expired: ${bidId} (age ${Math.round(ageMs / 60000)}min)`);
      return { error: 'Bid has expired', status: 400 } as const;
    }

    // Guard: reject if someone already outbid this amount
    if (bid.spot.currentBid > 0 && bid.amount <= bid.spot.currentBid) {
      console.warn(
        `[DePay callback] Rejecting bid ${bid.id}: amount $${bid.amount} <= current $${bid.spot.currentBid} on Spot #${bid.spot.number}`
      );
      return { error: 'Outbid by a higher bid', status: 409 } as const;
    }

    // Create Payment record
    await tx.payment.create({
      data: {
        bidId: bid.id,
        txHash: transaction || null,
        chainId,
        token: token || 'USDC',
        tokenAmount: String(amount || bid.amount),
        usdAmount: bid.amount,
        depositAddress: process.env.DEPAY_RECEIVER_ADDRESS || '',
        walletAddress: sender || '',
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
        currentWallet: sender || '',
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

  // Handle transaction results
  if ('error' in result) {
    console.error(`[DePay callback] ${result.error}: ${bidId}`);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if ('alreadyConfirmed' in result) {
    const responseBody = JSON.stringify({});
    const response = NextResponse.json({});
    response.headers.set('x-signature', signResponse(responseBody));
    return response;
  }

  console.log(
    `[DePay callback] Confirmed: Spot #${result.spotNumber} → ${result.brandName} at $${result.amount} (${blockchain}, tx: ${transaction})`
  );

  const responseBody = JSON.stringify({});
  const response = NextResponse.json({});
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
