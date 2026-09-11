import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase, BID_EXPIRY_MS } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const EXPIRY_MS = BID_EXPIRY_MS;

export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: 'bid-status' });
  if (rl) return rl;

  try {
    await ensureDatabase();

    const bidId = request.nextUrl.searchParams.get('bidId');
    if (!bidId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: bidId' },
        { status: 400 }
      );
    }

    const bid = await db.bid.findUnique({
      where: { id: bidId },
      include: { spot: true, payment: true },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Auto-expire stale AWAITING_PAYMENT bids
    let status = bid.status;
    const ageMs = Date.now() - bid.createdAt.getTime();

    if (status === 'AWAITING_PAYMENT' && ageMs > EXPIRY_MS) {
      // Check if there's a REJECTED payment (paid but no spots available)
      if (bid.payment?.status === 'REJECTED') {
        status = 'REJECTED';
      } else {
        await db.bid.update({
          where: { id: bidId },
          data: { status: 'EXPIRED' },
        });
        status = 'EXPIRED';
      }
    }

    // Detect REJECTED payment even before expiry
    if (status === 'AWAITING_PAYMENT' && bid.payment?.status === 'REJECTED') {
      status = 'REJECTED';
    }

    // Build refund info for rejected payments
    let refundInfo: { message: string; refundWallet?: string } | undefined;
    if (status === 'REJECTED' && bid.payment) {
      const isFiat = bid.payment.chainId === 0;
      if (isFiat) {
        refundInfo = {
          message: 'Your payment will be automatically refunded within 5-7 business days',
        };
      } else {
        refundInfo = {
          message: 'For crypto refunds, please contact us on X @methaboron',
          refundWallet: bid.payment.walletAddress || undefined,
        };
      }
    }

    return NextResponse.json({
      status,
      spotNumber: bid.spot.number,
      amount: bid.amount,
      brandName: bid.brandName,
      expired: status === 'EXPIRED',
      expiresIn: status === 'AWAITING_PAYMENT' ? Math.max(0, EXPIRY_MS - ageMs) : undefined,
      refundInfo,
    });
  } catch (error: unknown) {
    console.error('Error fetching bid status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
