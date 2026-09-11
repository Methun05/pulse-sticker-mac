import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: 'track-click' });
  if (rl) return rl;

  try {
    await ensureDatabase();
    const body = await request.json();
    const { spotId, spotNumber } = body;

    if (!spotId && !spotNumber) {
      return NextResponse.json({ success: false, error: 'Missing spotId or spotNumber' }, { status: 400 });
    }

    const where = spotId ? { id: spotId } : { number: parseInt(spotNumber, 10) };

    const updated = await db.spot.update({
      where,
      data: {
        clicksCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        number: true,
        clicksCount: true,
        currentWebsite: true,
      },
    });

    return NextResponse.json({
      success: true,
      spotId: updated.id,
      clicksCount: updated.clicksCount,
      website: updated.currentWebsite,
    });
  } catch (error: unknown) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
