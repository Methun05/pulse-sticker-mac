import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest } from '@/lib/depay';

export const dynamic = 'force-dynamic';

/**
 * DePay calls this on successful payment confirmation.
 * Payload: { blockchain, transaction, sender, receiver, token, amount, payload }
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  console.log('[DePay callback] Signature verified:', verified, 'Body:', body);

  const data = JSON.parse(body);

  console.log('[DePay callback] Payment confirmed:', {
    blockchain: data.blockchain,
    transaction: data.transaction,
    sender: data.sender,
    receiver: data.receiver,
    token: data.token,
    amount: data.amount,
    payload: data.payload,
  });

  // TODO: Update Bid/Spot/Board in DB based on data.payload.bidId
  // For now, just acknowledge

  return NextResponse.json({});
}
