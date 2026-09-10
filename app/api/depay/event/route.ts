import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest } from '@/lib/depay';

export const dynamic = 'force-dynamic';

/**
 * DePay sends payment lifecycle events: attempt, processing, failed, succeeded.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifyDepayRequest(body, signature)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const data = JSON.parse(body);

  console.log('[DePay event]', data.status, {
    blockchain: data.blockchain,
    transaction: data.transaction,
    sender: data.sender,
  });

  return NextResponse.json({});
}
