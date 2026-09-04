import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDatabase } from '@/lib/db';
import {
  TOKENS,
  CHAINS,
  NATIVE_TOKEN_CHAIN,
  getDepositAddresses,
  humanToBaseUnits,
  baseUnitsToHuman,
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

    // Phase 1: Only accept stablecoins (no price feed for ETH/BNB yet)
    if (tokenConfig.isNative) {
      return NextResponse.json(
        { success: false, error: `${token} not supported yet (no price feed). Use USDC, USDT, or DAI.` },
        { status: 400 }
      );
    }

    // For ERC20 tokens, verify the token is available on this chain
    if (!tokenConfig.contractAddresses[resolvedChainId]) {
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

    // Must outbid current holder by at least $1
    const minBid = spot.currentBid > 0
      ? spot.currentBid + 1
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

    // ── Make amount unique to avoid cross-match between concurrent payments ──

    // Query pending payments on this deposit address + token to find used amounts
    const pendingPayments = await db.payment.findMany({
      where: {
        depositAddress: depositAddress.toLowerCase(),
        token,
        chainId: resolvedChainId,
        status: { in: ['PENDING', 'CONFIRMING'] },
      },
      select: { tokenAmount: true },
    });
    const usedAmounts = new Set(pendingPayments.map(p => p.tokenAmount));

    // Add a small random offset (0.01–0.99) to make amount unique per address.
    // Try up to 100 times to find an unused amount.
    let uniqueAmount = parsedAmount;
    let tokenAmount: string;
    let attempts = 0;
    do {
      // First attempt uses exact amount; subsequent attempts add random cents
      if (attempts > 0) {
        const centsOffset = Math.floor(Math.random() * 99) + 1; // 1–99
        uniqueAmount = parsedAmount + centsOffset / 100;
      }
      tokenAmount = humanToBaseUnits(uniqueAmount, token).toString();
      attempts++;
    } while (usedAmounts.has(tokenAmount) && attempts < 100);

    if (usedAmounts.has(tokenAmount)) {
      return NextResponse.json(
        { success: false, error: 'Too many concurrent payments to this address. Please retry.' },
        { status: 429 }
      );
    }

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
      tokenAmountDisplay: baseUnitsToHuman(tokenAmount, token),
      token,
      chainId: resolvedChainId,
      chainName: CHAINS[resolvedChainId].name,
      usdAmount: parsedAmount,
      expiresAt: payment.expiresAt?.toISOString(),
      note: uniqueAmount !== parsedAmount
        ? `Send exactly ${baseUnitsToHuman(tokenAmount, token)} ${token} (includes unique identifier cents)`
        : undefined,
    });
  } catch (error: unknown) {
    console.error('Error initiating payment:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
