import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest, signResponse } from '@/lib/depay';

export const dynamic = 'force-dynamic';

/**
 * DePay calls this on successful payment confirmation.
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

  const responseData = {};
  const responseBody = JSON.stringify(responseData);
  const response = NextResponse.json(responseData);
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
