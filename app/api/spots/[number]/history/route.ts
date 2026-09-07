import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    await ensureDatabase();

    const num = parseInt(params.number);
    if (isNaN(num)) {
      return NextResponse.json(
        { success: false, error: 'Invalid spot number' },
        { status: 400 }
      );
    }

    const spot = await db.spot.findFirst({
      where: { number: num },
      include: {
        bids: {
          where: { status: { in: ['CONFIRMED', 'OUTBID'] } },
          orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
          include: {
            payment: {
              select: { txHash: true, chainId: true, token: true },
            },
          },
        },
      },
    });

    if (!spot) {
      return NextResponse.json(
        { success: false, error: `Spot #${num} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      spot: {
        number: spot.number,
        position: spot.position,
        size: spot.size,
        currentBid: spot.currentBid,
        currentBrandName: spot.currentBrandName,
        bidCount: spot.bidCount,
      },
      bids: spot.bids.map(b => ({
        brandName: b.brandName,
        amount: b.amount,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        txHash: b.payment?.txHash ?? null,
        chainId: b.payment?.chainId ?? null,
        token: b.payment?.token ?? null,
      })),
    });
  } catch (error: unknown) {
    console.error('Error fetching spot history:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
