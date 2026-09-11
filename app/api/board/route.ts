import { NextResponse } from 'next/server';
import { db, ensureDatabase, BID_EXPIRY_MS } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabase();

    const board = await db.board.findFirst({
      include: {
        spots: {
          orderBy: { number: 'asc' },
          include: {
            bids: {
              where: { status: 'CONFIRMED' },
              orderBy: { amount: 'desc' },
              take: 1,
            },
            _count: {
              select: { bids: { where: { status: 'OUTBID' } } },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    // Build leaderboard: spots sorted by currentBid descending
    const leaderboard = [...board.spots]
      .sort((a, b) => b.currentBid - a.currentBid)
      .map((spot, index) => ({
        rank: index + 1,
        spotNumber: spot.number,
        position: spot.position,
        size: spot.size,
        tier: spot.tier,
        currentBid: spot.currentBid,
        brandName: spot.currentBrandName,
        logoUrl: spot.currentLogoUrl,
        website: spot.currentWebsite,
        status: spot.status,
        bidCount: spot.bidCount,
        outbidCount: spot._count.bids,
        clicksCount: spot.clicksCount,
      }));

    // Stats
    const occupiedCount = board.spots.filter(s => s.status === 'OCCUPIED').length;
    const totalBids = board.spots.reduce((sum, s) => sum + s.bidCount, 0);

    // Clean up orphaned bids across all spots
    db.bid.updateMany({
      where: {
        status: 'AWAITING_PAYMENT',
        createdAt: { lt: new Date(Date.now() - BID_EXPIRY_MS) },
      },
      data: { status: 'EXPIRED' },
    }).catch((err: unknown) => console.warn('Orphaned bid cleanup failed:', err));

    // Recent confirmed bids
    const recentBids = await db.bid.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { spot: true },
    });

    return NextResponse.json({
      success: true,
      board: {
        id: board.id,
        title: board.title,
        status: board.status,
        totalRaised: board.totalRaised,
      },
      spots: board.spots.map(s => ({
        id: s.id,
        number: s.number,
        position: s.position,
        size: s.size,
        tier: s.tier,
        startingPrice: s.startingPrice,
        currentBid: s.currentBid,
        brandName: s.currentBrandName,
        logoUrl: s.currentLogoUrl,
        website: s.currentWebsite,
        status: s.status,
        bidCount: s.bidCount,
        outbidCount: s._count.bids,
        clicksCount: s.clicksCount,
      })),
      leaderboard,
      stats: {
        totalRaised: board.totalRaised,
        occupiedSpots: occupiedCount,
        totalSpots: board.spots.length,
        totalBids,
      },
      recentBids: recentBids.map(b => ({
        brandName: b.brandName,
        amount: b.amount,
        spotNumber: b.spot.number,
        timestamp: b.updatedAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
