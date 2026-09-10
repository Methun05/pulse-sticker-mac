import { NextRequest, NextResponse } from 'next/server';
import { verifyDepayRequest, signResponse } from '@/lib/depay';
import { db, ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RECEIVER = process.env.DEPAY_RECEIVER_ADDRESS || '0x0000000000000000000000000000000000000000';

// USDC contract addresses per DePay blockchain name
const USDC_TOKENS: Record<string, string> = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

/**
 * DePay calls this endpoint to get payment configuration (amount, token, receiver).
 * We look up the bid from payload.bidId and return the trusted amount from DB.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  const verified = verifyDepayRequest(body, signature);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!RECEIVER || RECEIVER === '0x0000000000000000000000000000000000000000') {
    return NextResponse.json({ error: 'Payment receiver not configured' }, { status: 503 });
  }

  const payload = JSON.parse(body);
  const bidId = payload?.bidId;

  if (!bidId) {
    return NextResponse.json({ error: 'Missing bidId in payload' }, { status: 400 });
  }

  await ensureDatabase();
  const bid = await db.bid.findUnique({ where: { id: bidId } });

  if (!bid || bid.status !== 'AWAITING_PAYMENT') {
    return NextResponse.json({ error: 'Bid not found or not awaiting payment' }, { status: 400 });
  }

  // Reject expired bids (30-minute window)
  const ageMs = Date.now() - new Date(bid.createdAt).getTime();
  if (ageMs > 30 * 60 * 1000) {
    return NextResponse.json({ error: 'Bid has expired' }, { status: 400 });
  }

  const configuration = {
    accept: Object.entries(USDC_TOKENS).map(([blockchain, token]) => ({
      blockchain,
      amount: bid.amount,
      token,
      receiver: RECEIVER,
    })),
  };

  const responseBody = JSON.stringify(configuration);
  const response = NextResponse.json(configuration);
  response.headers.set('x-signature', signResponse(responseBody));
  return response;
}
