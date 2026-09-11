import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

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
      include: { spot: true },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Auto-expire stale AWAITING_PAYMENT bids
    let status = bid.status;
    const ageMs = Date.now() - bid.createdAt.getTime();

    if (status === 'AWAITING_PAYMENT' && ageMs > EXPIRY_MS) {
      await db.bid.update({
        where: { id: bidId },
        data: { status: 'EXPIRED' },
      });
      status = 'EXPIRED';
    }

    return NextResponse.json({
      status,
      spotNumber: bid.spot.number,
      amount: bid.amount,
      brandName: bid.brandName,
      expired: status === 'EXPIRED',
      expiresIn: status === 'AWAITING_PAYMENT' ? Math.max(0, EXPIRY_MS - ageMs) : undefined,
    });
  } catch (error: unknown) {
    console.error('Error fetching bid status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
