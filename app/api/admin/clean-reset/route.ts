import { NextRequest, NextResponse } from 'next/server';
import { db, MACBOOK_SPOTS } from '@/lib/db';
import { isAuthorized, unauthorizedResponse } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Changed from GET to POST — destructive actions must not be on GET
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 3, windowMs: 60_000, prefix: 'admin-reset' });
  if (rl) return rl;

  if (!isAuthorized(request)) return unauthorizedResponse();

  try {
    await db.payment.deleteMany({});
    await db.bid.deleteMany({});
    await db.spot.deleteMany({});
    await db.board.deleteMany({});

    const board = await db.board.create({
      data: {
        title: 'PulseChain MacBook Sticker Board',
        status: 'LIVE',
        totalRaised: 0,
      },
    });

    for (const s of MACBOOK_SPOTS) {
      await db.spot.create({
        data: {
          boardId: board.id,
          number: s.number,
          position: s.position,
          size: s.size,
          tier: 'PHYSICAL',
          startingPrice: s.startingPrice,
          currentBid: 0,
          status: 'AVAILABLE',
          bidCount: 0,
          clicksCount: 0,
        },
      });
    }

    await db.adminConfig.upsert({
      where: { id: 'default_config' },
      update: { pageViews: 0, siteActive: true },
      create: { id: 'default_config', pageViews: 0, siteActive: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Clean reset complete. 10 spots created.',
      spotsCount: MACBOOK_SPOTS.length,
    });
  } catch (error: unknown) {
    console.error('Clean reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
