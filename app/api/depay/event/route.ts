import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest, signResponse } from '@/lib/depay';

export const dynamic = 'force-dynamic';

/**
 * DePay sends payment lifecycle events: attempt, processing, failed, succeeded.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  console.log('[DePay event]', 'Body:', body);

  const responseData = {};
  const responseBody = JSON.stringify(responseData);
  const response = NextResponse.json(responseData);
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
