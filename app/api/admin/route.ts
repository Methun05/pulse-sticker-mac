import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase, MACBOOK_SPOTS } from '@/lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin_pulse_sticker_2026';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureDatabase();
    const board = await db.board.findFirst({
      include: {
        spots: {
          orderBy: { number: 'asc' },
          include: {
            bids: {
              orderBy: { createdAt: 'desc' },
              include: { payment: true },
            },
          },
        },
      },
    });

    const allPayments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bid: { include: { spot: true } },
      },
    });

    return NextResponse.json({
      success: true,
      board,
      payments: allPayments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureDatabase();
    const body = await request.json();
    const { action } = body;

    if (action === 'PAUSE_BOARD') {
      const board = await db.board.findFirst();
      if (!board) return NextResponse.json({ error: 'No board found' }, { status: 404 });
      await db.board.update({ where: { id: board.id }, data: { status: 'PAUSED' } });
      return NextResponse.json({ success: true, message: 'Board paused' });
    }

    if (action === 'RESUME_BOARD') {
      const board = await db.board.findFirst();
      if (!board) return NextResponse.json({ error: 'No board found' }, { status: 404 });
      await db.board.update({ where: { id: board.id }, data: { status: 'LIVE' } });
      return NextResponse.json({ success: true, message: 'Board resumed' });
    }

    if (action === 'UPDATE_SPOT_PRICE') {
      const { spotId, startingPrice } = body;
      await db.spot.update({
        where: { id: spotId },
        data: { startingPrice: parseFloat(startingPrice) },
      });
      return NextResponse.json({ success: true, message: 'Spot price updated' });
    }

    if (action === 'RESET') {
      await db.payment.deleteMany({});
      await db.bid.deleteMany({});
      await db.spot.deleteMany({});
      await db.board.deleteMany({});

      const board = await db.board.create({
        data: { title: 'PulseChain MacBook Sticker Board', status: 'LIVE', totalRaised: 0 },
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

      return NextResponse.json({ success: true, message: 'Board reset complete' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
