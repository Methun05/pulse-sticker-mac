import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase, MACBOOK_SPOTS } from '@/lib/db';
import { isAuthorized, unauthorizedResponse } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000, prefix: 'admin' });
  if (rl) return rl;

  if (!isAuthorized(request)) return unauthorizedResponse();

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

    const pendingLogoBids = await db.bid.findMany({
      where: { status: 'CONFIRMED', logoStatus: 'PENDING_REVIEW' },
      orderBy: { logoUploadedAt: 'asc' },
      include: {
        spot: true,
        payment: { select: { token: true, chainId: true, txHash: true, confirmedAt: true } },
      },
    });

    return NextResponse.json({
      success: true,
      board,
      payments: allPayments,
      pendingLogoBids,
    });
  } catch (error: unknown) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'admin' });
  if (rl) return rl;

  if (!isAuthorized(request)) return unauthorizedResponse();

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

    if (action === 'APPROVE_LOGO') {
      const { bidId } = body;
      if (typeof bidId !== 'string') {
        return NextResponse.json({ error: 'Invalid bid ID' }, { status: 400 });
      }

      const approved = await db.$transaction(async (tx) => {
        const bid = await tx.bid.findFirst({
          where: { id: bidId, status: 'CONFIRMED', logoStatus: 'PENDING_REVIEW', logoUrl: { not: null } },
          select: { id: true, spotId: true, logoUrl: true, brandName: true },
        });
        if (!bid || !bid.logoUrl) return null;

        await tx.bid.update({
          where: { id: bid.id },
          data: { logoStatus: 'APPROVED', logoReviewedAt: new Date() },
        });
        await tx.spot.update({
          where: { id: bid.spotId },
          data: { currentLogoUrl: bid.logoUrl },
        });
        return bid;
      });

      if (!approved) {
        return NextResponse.json({ error: 'Logo is no longer awaiting approval' }, { status: 409 });
      }
      return NextResponse.json({ success: true, message: `${approved.brandName}'s logo approved` });
    }

    if (action === 'REJECT_LOGO') {
      const { bidId } = body;
      if (typeof bidId !== 'string') {
        return NextResponse.json({ error: 'Invalid bid ID' }, { status: 400 });
      }

      const rejected = await db.bid.updateMany({
        where: { id: bidId, status: 'CONFIRMED', logoStatus: 'PENDING_REVIEW' },
        data: { logoStatus: 'REJECTED', logoReviewedAt: new Date() },
      });
      if (rejected.count === 0) {
        return NextResponse.json({ error: 'Logo is no longer awaiting approval' }, { status: 409 });
      }
      return NextResponse.json({ success: true, message: 'Logo rejected. The bidder can submit a replacement.' });
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
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
