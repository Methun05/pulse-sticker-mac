import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'ethers';
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
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000, prefix: 'payment-initiate' });
  if (rl) return rl;

  try {
    await ensureDatabase();
    const body = await request.json();
    const {
      bidId,
      walletAddress,
      token = 'USDC',
      chainId = 1,
    } = body;

    // ── Validate inputs ──────────────────────────────────────────────────

    if (!bidId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bidId, walletAddress' },
        { status: 400 }
      );
    }

    const normalizedWallet = typeof walletAddress === 'string' ? walletAddress.trim() : '';

    if (!isAddress(normalizedWallet)) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid EVM wallet address' },
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
    const requestedChainId = typeof chainId === 'number' ? chainId : Number(chainId);
    const resolvedChainId = tokenConfig.isNative
      ? NATIVE_TOKEN_CHAIN[token] || requestedChainId
      : requestedChainId;

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

    // ── Look up bid ───────────────────────────────────────────────────────

    const bid = await db.bid.findUnique({
      where: { id: bidId },
      include: { spot: { include: { board: true } } },
    });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: 'Bid not found' },
        { status: 404 }
      );
    }

    if (bid.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'This bid already has a payment or has expired' },
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

    // ── Make amount unique ───────────────────────────────────────────────

    const parsedAmount = bid.amount;

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

    let uniqueAmount = parsedAmount;
    let tokenAmount: string;
    let attempts = 0;
    do {
      if (attempts > 0) {
        const centsOffset = Math.floor(Math.random() * 99) + 1;
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

    // ── Update bid + create payment ──────────────────────────────────────

    await db.bid.update({
      where: { id: bidId },
      data: {
        walletAddress: normalizedWallet.toLowerCase(),
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
        walletAddress: normalizedWallet.toLowerCase(),
        status: 'PENDING',
        startBlock,
        startBalance,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
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
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
