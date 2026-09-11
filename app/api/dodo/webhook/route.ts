import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/dodo';
import { ensureDatabase } from '@/lib/db';
import { confirmBidTransaction } from '@/lib/confirm-bid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verify webhook signature
  let payload: Record<string, unknown>;
  try {
    payload = verifyWebhook(body, headers) as Record<string, unknown>;
  } catch (err) {
    console.error('[DoDo webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = payload.event_type as string;

  // Only handle payment.succeeded — failed/cancelled bids expire naturally
  if (eventType !== 'payment.succeeded') {
    console.log(`[DoDo webhook] Ignoring event: ${eventType}`);
    return NextResponse.json({ received: true });
  }

  const data = payload.data as Record<string, unknown>;
  const metadata = data?.metadata as Record<string, string> | undefined;
  const bidId = metadata?.bidId;
  const dodoPaymentId = data?.payment_id as string | undefined;

  if (!bidId) {
    console.error('[DoDo webhook] Missing bidId in metadata');
    return NextResponse.json({ received: true, error: 'Missing bidId' });
  }

  await ensureDatabase();

  const result = await confirmBidTransaction({
    bidId,
    txHash: dodoPaymentId || `dodo_${bidId}`,
    chainId: 0,
    token: 'FIAT',
    tokenAmount: String(0),
    depositAddress: '',
    walletAddress: '',
  });

  if ('error' in result) {
    console.error(`[DoDo webhook] ${result.error}: ${bidId}`);
    return NextResponse.json({ received: true, error: result.error });
  }

  if ('amountMismatch' in result) {
    console.warn(
      `[DoDo webhook] Amount mismatch for bid ${result.bidId}: expected $${result.expected}, received $${result.received}`
    );
    return NextResponse.json({ received: true, refundNeeded: true });
  }

  if ('alreadyConfirmed' in result) {
    return NextResponse.json({ received: true });
  }

  if ('outbidNoSpot' in result) {
    console.warn(`[DoDo webhook] Outbid, no free spot for bid ${result.bidId} ($${result.amount}) — refund needed`);
    return NextResponse.json({ received: true, refundNeeded: true });
  }

  const logExtra = result.reassigned ? ` (reassigned to Spot #${result.newSpotNumber})` : '';
  console.log(
    `[DoDo webhook] Confirmed: Spot #${result.spotNumber} → ${result.brandName} at $${result.amount} (fiat via DoDo, payment: ${dodoPaymentId})${logExtra}`
  );

  return NextResponse.json({ received: true });
}
