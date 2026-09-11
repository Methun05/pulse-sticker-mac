import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { db, ensureDatabase, BID_EXPIRY_MS } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'bid-create' });
  if (rl) return rl;

  try {
    await ensureDatabase();
    const body = await request.json();
    const {
      spotNumber,
      bidAmount,
      brandName: rawBrandName,
      website = '',
      email = '',
      xHandle = '',
    } = body;

    // ── Validate inputs ──────────────────────────────────────────────────

    const brandName = typeof rawBrandName === 'string' ? rawBrandName.trim() : '';
    const normalizedWebsite = typeof website === 'string' ? website.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';

    if (!spotNumber || bidAmount === undefined || !brandName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: spotNumber, bidAmount, brandName' },
        { status: 400 }
      );
    }

    if (brandName.length > 80) {
      return NextResponse.json(
        { success: false, error: 'Brand name must be 80 characters or fewer' },
        { status: 400 }
      );
    }

    if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
      return NextResponse.json(
        { success: false, error: 'Website must start with http:// or https://' },
        { status: 400 }
      );
    }
    if (normalizedWebsite.length > 2_048) {
      return NextResponse.json(
        { success: false, error: 'Website URL is too long' },
        { status: 400 }
      );
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const cleanXHandle = typeof xHandle === 'string' ? xHandle.trim().replace(/^@/, '') : '';
    if (cleanXHandle.length > 15 || (cleanXHandle && !/^[A-Za-z0-9_]+$/.test(cleanXHandle))) {
      return NextResponse.json(
        { success: false, error: 'X handle must contain only letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    const parsedAmount = typeof bidAmount === 'number' ? bidAmount : Number(bidAmount);
    if (!Number.isFinite(parsedAmount) || !Number.isInteger(parsedAmount) || parsedAmount < 5) {
      return NextResponse.json(
        { success: false, error: 'Bid must be a whole-dollar amount of at least $5' },
        { status: 400 }
      );
    }

    if (parsedAmount > 400) {
      return NextResponse.json(
        { success: false, error: 'Maximum bid amount is $400' },
        { status: 400 }
      );
    }

    const num = typeof spotNumber === 'number' ? spotNumber : Number(spotNumber);
    if (!Number.isInteger(num) || num < 1 || num > 18) {
      return NextResponse.json(
        { success: false, error: 'Invalid spot number' },
        { status: 400 }
      );
    }

    // ── Find spot and validate bid ───────────────────────────────────────

    const spot = await db.spot.findFirst({
      where: { number: num },
      include: { board: true },
    });

    if (!spot) {
      return NextResponse.json(
        { success: false, error: `Spot #${spotNumber} not found` },
        { status: 404 }
      );
    }

    if (spot.board.status === 'PAUSED') {
      return NextResponse.json(
        { success: false, error: 'The board is currently paused' },
        { status: 400 }
      );
    }

    const minBid = spot.currentBid > 0
      ? spot.currentBid + 5
      : spot.startingPrice;

    if (parsedAmount < minBid) {
      return NextResponse.json(
        { success: false, error: `Bid must be at least $${minBid}. Current highest: $${spot.currentBid}` },
        { status: 400 }
      );
    }

    // ── Expire stale AWAITING_PAYMENT bids for this spot ─────────────────
    await db.bid.updateMany({
      where: {
        spotId: spot.id,
        status: 'AWAITING_PAYMENT',
        createdAt: { lt: new Date(Date.now() - BID_EXPIRY_MS) },
      },
      data: { status: 'EXPIRED' },
    });

    // ── Create bid record ─────────────────────────────────────────────────

    const uploadToken = randomBytes(32).toString('hex');
    const uploadTokenHash = createHash('sha256').update(uploadToken).digest('hex');

    const bid = await db.bid.create({
      data: {
        spotId: spot.id,
        walletAddress: '', // set later when payment method chosen
        brandName,
        website: normalizedWebsite || null,
        email: normalizedEmail || null,
        xHandle: cleanXHandle || null,
        uploadTokenHash,
        amount: parsedAmount,
        status: 'AWAITING_PAYMENT',
      },
    });

    return NextResponse.json({
      success: true,
      bidId: bid.id,
      uploadToken,
      expiresAt: new Date(Date.now() + BID_EXPIRY_MS).toISOString(),
      minBid,
    });
  } catch (error: unknown) {
    console.error('Error creating bid:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
