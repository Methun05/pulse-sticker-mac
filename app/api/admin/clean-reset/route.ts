import { NextRequest, NextResponse } from 'next/server';
import { db, MACBOOK_SPOTS } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_pulse_sticker_2026';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const key = request.nextUrl.searchParams.get('key');
  return token === ADMIN_PASSWORD || key === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete all data
    await db.payment.deleteMany({});
    await db.bid.deleteMany({});
    await db.spot.deleteMany({});
    await db.board.deleteMany({});

    // Create fresh board
    const board = await db.board.create({
      data: {
        title: 'PulseChain MacBook Sticker Board',
        status: 'LIVE',
        totalRaised: 0,
      },
    });

    // Create 10 spots
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

    // Reset admin config
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
    const message = error instanceof Error ? error.message : 'Reset failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
