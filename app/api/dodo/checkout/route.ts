import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { createCheckoutSession } from '@/lib/dodo';

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'dodo-checkout' });
  if (rl) return rl;

  try {
    await ensureDatabase();
    const { bidId } = await request.json();

    if (!bidId || typeof bidId !== 'string') {
      return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
    }

    const bid = await db.bid.findUnique({ where: { id: bidId } });
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (bid.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json({ error: 'Bid is not awaiting payment' }, { status: 400 });
    }

    // Reject expired bids (30-minute window)
    const ageMs = Date.now() - new Date(bid.createdAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      return NextResponse.json({ error: 'Bid has expired' }, { status: 400 });
    }

    const session = await createCheckoutSession(bidId, bid.amount, bid.email || undefined);

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error) {
    console.error('[DoDo checkout] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
