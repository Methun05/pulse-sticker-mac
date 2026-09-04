import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import {
  TOKENS,
  CHAINS,
  NATIVE_TOKEN_CHAIN,
  getDepositAddresses,
  humanToBaseUnits,
  snapshotBlockchainState,
} from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const body = await request.json();
    const {
      spotNumber,
      bidAmount, // USD value
      brandName,
      website = '',
      logoUrl = '',
      walletAddress,
      token = 'USDC',
      chainId = 1,
    } = body;

    // ── Validate inputs ──────────────────────────────────────────────────

    if (!spotNumber || !bidAmount || !brandName || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: spotNumber, bidAmount, brandName, walletAddress' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(bidAmount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return NextResponse.json(
        { success: false, error: 'Minimum bid is $1' },
        { status: 400 }
      );
    }

    // Validate token
    const tokenConfig = TOKENS[token];
    if (!tokenConfig) {
      return NextResponse.json(
        { success: false, error: `Unsupported token: ${token}. Supported: ${Object.keys(TOKENS).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate chain
    const resolvedChainId = tokenConfig.isNative
      ? NATIVE_TOKEN_CHAIN[token] || chainId
      : chainId;

    if (!CHAINS[resolvedChainId]) {
      return NextResponse.json(
        { success: false, error: `Unsupported chain: ${resolvedChainId}` },
        { status: 400 }
      );
    }

    // For ERC20 tokens, verify the token is available on this chain
    if (!tokenConfig.isNative && !tokenConfig.contractAddresses[resolvedChainId]) {
      return NextResponse.json(
        { success: false, error: `${token} is not available on ${CHAINS[resolvedChainId].name}` },
        { status: 400 }
      );
    }

    // ── Find spot and validate bid ───────────────────────────────────────

    const num = parseInt(String(spotNumber));
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

    // Must outbid current holder
    const minBid = spot.currentBid > 0
      ? spot.currentBid + spot.startingPrice
      : spot.startingPrice;

    if (parsedAmount < minBid) {
      return NextResponse.json(
        { success: false, error: `Bid must be at least $${minBid}. Current highest: $${spot.currentBid}` },
        { status: 400 }
      );
    }

    // ── Pick deposit address (rotation) ──────────────────────────────────

    const addresses = getDepositAddresses(resolvedChainId);
    if (addresses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No deposit addresses configured for this chain' },
        { status: 500 }
      );
    }

    // Count pending payments per address, pick the one with fewer
    const counts = await Promise.all(
      addresses.map(addr =>
        db.payment.count({
          where: {
            depositAddress: addr.toLowerCase(),
            status: { in: ['PENDING', 'CONFIRMING'] },
          },
        })
      )
    );

    let minIdx = 0;
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] < counts[minIdx]) minIdx = i;
    }
    const depositAddress = addresses[minIdx];

    // ── Convert amount to base units ─────────────────────────────────────

    // For stablecoins (USDC/USDT/DAI), amount = USD value directly
    // For ETH/BNB, we'd need a price feed — for now, bidAmount IS the USD value
    // and tokenAmount is the same (user sends exact token amount shown)
    const tokenAmount = humanToBaseUnits(parsedAmount, token).toString();

    // ── Snapshot blockchain state ────────────────────────────────────────

    const { startBlock, startBalance } = await snapshotBlockchainState(
      resolvedChainId,
      token,
      depositAddress
    );

    // ── Create bid + payment records ─────────────────────────────────────

    const bid = await db.bid.create({
      data: {
        spotId: spot.id,
        walletAddress: walletAddress.toLowerCase(),
        brandName,
        website: website || null,
        logoUrl: logoUrl || null,
        amount: parsedAmount,
        status: 'PENDING',
      },
    });

    const payment = await db.payment.create({
      data: {
        bidId: bid.id,
        chainId: resolvedChainId,
        token,
        tokenAmount,
        usdAmount: parsedAmount,
        depositAddress: depositAddress.toLowerCase(),
        walletAddress: walletAddress.toLowerCase(),
        status: 'PENDING',
        startBlock,
        startBalance,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      },
    });

    return NextResponse.json({
      success: true,
      bidId: bid.id,
      paymentId: payment.id,
      depositAddress,
      tokenAmount,
      token,
      chainId: resolvedChainId,
      chainName: CHAINS[resolvedChainId].name,
      usdAmount: parsedAmount,
      expiresAt: payment.expiresAt?.toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error initiating payment:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
