import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest, signResponse } from '@/lib/depay';
import { ensureDatabase } from '@/lib/db';
import { confirmBidTransaction } from '@/lib/confirm-bid';

export const dynamic = 'force-dynamic';

/**
 * DePay calls this on successful payment confirmation.
 * We update Bid → CONFIRMED, Spot, Board in an atomic transaction.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(body);
  const { blockchain, transaction, sender, token, amount, payload: callbackPayload } = data;
  const bidId = callbackPayload?.bidId;

  if (!bidId) {
    console.error('[DePay callback] Missing bidId in payload');
    return NextResponse.json({ error: 'Missing bidId' }, { status: 400 });
  }

  await ensureDatabase();

  // Map DePay blockchain name to chainId
  const CHAIN_IDS: Record<string, number> = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    base: 8453,
  };
  const chainId = CHAIN_IDS[blockchain] || 0;

  const result = await confirmBidTransaction({
    bidId,
    txHash: transaction || null,
    chainId,
    token: token || 'USDC',
    tokenAmount: String(amount || 0),
    depositAddress: process.env.DEPAY_RECEIVER_ADDRESS || '',
    walletAddress: sender || '',
  });

  // Handle results
  if ('error' in result) {
    console.error(`[DePay callback] ${result.error}: ${bidId}`);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if ('alreadyConfirmed' in result) {
    const responseBody = JSON.stringify({});
    const response = NextResponse.json({});
    response.headers.set('x-signature', signResponse(responseBody));
    return response;
  }

  if ('outbidNoSpot' in result) {
    console.warn(`[DePay callback] Outbid, no free spot for bid ${result.bidId} ($${result.amount})`);
    // DePay expects 200 — we accepted the payment but need manual refund
    const responseBody = JSON.stringify({});
    const response = NextResponse.json({});
    response.headers.set('x-signature', signResponse(responseBody));
    return response;
  }

  const logExtra = result.reassigned ? ` (reassigned to Spot #${result.newSpotNumber})` : '';
  console.log(
    `[DePay callback] Confirmed: Spot #${result.spotNumber} → ${result.brandName} at $${result.amount} (${blockchain}, tx: ${transaction})${logExtra}`
  );

  const responseBody = JSON.stringify({});
  const response = NextResponse.json({});
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
