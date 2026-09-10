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

  const bid = await db.bid.findUnique({
    where: { id: bidId },
    include: { spot: { include: { board: true } } },
  });

  if (!bid) {
    console.error('[DePay callback] Bid not found:', bidId);
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  // Idempotent: if already confirmed, return success
  if (bid.status === 'CONFIRMED') {
    const responseBody = JSON.stringify({});
    const response = NextResponse.json({});
    response.headers.set('x-signature', signResponse(responseBody));
    return response;
  }

  // Map DePay blockchain name to chainId
  const CHAIN_IDS: Record<string, number> = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    base: 8453,
  };
  const chainId = CHAIN_IDS[blockchain] || 0;

  await db.$transaction(async (tx) => {
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
  });

  console.log(
    `[DePay callback] Confirmed: Spot #${bid.spot.number} → ${bid.brandName} at $${bid.amount} (${blockchain}, tx: ${transaction})`
  );

  const responseBody = JSON.stringify({});
  const response = NextResponse.json({});
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
