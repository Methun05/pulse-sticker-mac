import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import { verifyPayment } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureDatabase();
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bidId');
    const paymentId = searchParams.get('paymentId');

    if (!bidId && !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Provide bidId or paymentId' },
        { status: 400 }
      );
    }

    // ── Find payment ─────────────────────────────────────────────────────

    const payment = await db.payment.findFirst({
      where: bidId ? { bidId } : { id: paymentId! },
      include: {
        bid: {
          include: {
            spot: { include: { board: true } },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Already confirmed
    if (payment.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        confirmed: true,
        status: payment.status,
        txHash: payment.txHash,
        bidId: payment.bidId,
      });
    }

    // Already failed or expired
    if (payment.status === 'FAILED' || payment.status === 'EXPIRED') {
      return NextResponse.json({
        success: true,
        confirmed: false,
        status: payment.status,
        bidId: payment.bidId,
      });
    }

    // Check expiry
    if (payment.expiresAt && new Date(payment.expiresAt) < new Date()) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' },
      });
      await db.bid.update({
        where: { id: payment.bidId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({
        success: true,
        confirmed: false,
        status: 'EXPIRED',
        bidId: payment.bidId,
      });
    }

    // ── Verify on-chain ──────────────────────────────────────────────────

    if (!payment.startBlock || !payment.startBalance) {
      return NextResponse.json({
        success: true,
        confirmed: false,
        status: 'PENDING',
        message: 'Payment initializing, retry shortly',
      }, { status: 202 });
    }

    const result = await verifyPayment(
      payment.chainId,
      payment.token,
      payment.depositAddress,
      payment.startBlock,
      payment.startBalance,
      payment.tokenAmount
    );

    if (!result.confirmed) {
      return NextResponse.json({
        success: true,
        confirmed: false,
        status: 'PENDING',
        bidId: payment.bidId,
        depositAddress: payment.depositAddress,
        token: payment.token,
        chainId: payment.chainId,
      });
    }

    // ── Payment confirmed! Update everything in a transaction ─────────────

    await db.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CONFIRMED',
          txHash: result.txHash || null,
          confirmedAt: new Date(),
        },
      });

      // Mark previous confirmed bids on this spot as OUTBID
      await tx.bid.updateMany({
        where: {
          spotId: payment.bid.spotId,
          id: { not: payment.bidId },
          status: 'CONFIRMED',
        },
        data: { status: 'OUTBID' },
      });

      // Confirm this bid
      await tx.bid.update({
        where: { id: payment.bidId },
        data: { status: 'CONFIRMED' },
      });

      // Update spot with new highest bidder
      await tx.spot.update({
        where: { id: payment.bid.spotId },
        data: {
          currentBid: payment.bid.amount,
          currentBrandName: payment.bid.brandName,
          currentLogoUrl: payment.bid.logoUrl,
          currentWebsite: payment.bid.website,
          currentWallet: payment.bid.walletAddress,
          status: 'OCCUPIED',
          bidCount: { increment: 1 },
        },
      });

      // Recalculate total raised
      const allSpots = await tx.spot.findMany({
        where: { boardId: payment.bid.spot.boardId },
      });
      const totalRaised = allSpots.reduce((sum, s) => sum + Math.max(s.currentBid, 0), 0);

      await tx.board.update({
        where: { id: payment.bid.spot.boardId },
        data: { totalRaised },
      });
    });

    console.log(
      `[Payment Confirmed] Spot #${payment.bid.spot.number} -> ${payment.bid.brandName} at $${payment.bid.amount} (${payment.token} on chain ${payment.chainId})`
    );

    return NextResponse.json({
      success: true,
      confirmed: true,
      status: 'CONFIRMED',
      txHash: result.txHash,
      bidId: payment.bidId,
      spotNumber: payment.bid.spot.number,
      brandName: payment.bid.brandName,
      amount: payment.bid.amount,
    });
  } catch (error: unknown) {
    console.error('Error checking payment status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
