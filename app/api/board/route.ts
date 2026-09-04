import { NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import { TOKENS, CHAINS } from '@/lib/crypto';

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
        walletAddress: spot.currentWallet,
        status: spot.status,
        bidCount: spot.bidCount,
        clicksCount: spot.clicksCount,
      }));

    // Stats
    const occupiedCount = board.spots.filter(s => s.status === 'OCCUPIED').length;
    const totalBids = board.spots.reduce((sum, s) => sum + s.bidCount, 0);

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
      supportedTokens: Object.entries(TOKENS).map(([key, t]) => ({
        symbol: key,
        decimals: t.decimals,
        isNative: t.isNative,
        chains: t.isNative
          ? [CHAINS[key === 'ETH' ? 1 : key === 'BNB' ? 56 : 1]]
          : Object.keys(t.contractAddresses).map(cid => CHAINS[parseInt(cid)]).filter(Boolean),
      })),
      supportedChains: Object.values(CHAINS).map(c => ({
        chainId: c.chainId,
        name: c.name,
      })),
    });
  } catch (error: unknown) {
    console.error('Error fetching board:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
