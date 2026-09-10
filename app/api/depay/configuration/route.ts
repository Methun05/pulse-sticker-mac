import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest } from '@/lib/depay';

export const dynamic = 'force-dynamic';

/**
 * DePay calls this endpoint to get payment configuration (amount, token, receiver).
 * We return what tokens/chains to accept and the amount based on the payload.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  console.log('[DePay config] Signature verified:', verified, 'Signature present:', !!signature);
  console.log('[DePay config] Body:', body);

  const payload = JSON.parse(body);

  // TODO: Look up bid from payload and return dynamic amount + receiver
  // For now, return a test configuration
  console.log('[DePay config] Received:', payload);

  // Example: accept USDC on multiple chains
  // Replace RECEIVER_ADDRESS with your actual wallet
  const RECEIVER = process.env.DEPAY_RECEIVER_ADDRESS || '0x0000000000000000000000000000000000000000';

  const amount = payload?.amount || 1; // USD amount from frontend payload

  return NextResponse.json({
    accept: [
      {
        blockchain: 'ethereum',
        amount,
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
        receiver: RECEIVER,
      },
      {
        blockchain: 'bsc',
        amount,
        token: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
        receiver: RECEIVER,
      },
      {
        blockchain: 'polygon',
        amount,
        token: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC on Polygon
        receiver: RECEIVER,
      },
      {
        blockchain: 'base',
        amount,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        receiver: RECEIVER,
      },
    ],
  });
}
