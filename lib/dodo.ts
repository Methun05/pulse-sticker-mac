import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: 'test_mode',
});

export async function createCheckoutSession(bidId: string, dollarAmount: number, email?: string) {
  const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;
  if (!productId) throw new Error('NEXT_PUBLIC_DODO_PRODUCT_ID not set');

  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      { product_id: productId, quantity: 1, amount: dollarAmount * 100 },
    ],
    metadata: { bidId },
    return_url: `${siteUrl}?bidId=${bidId}`,
    customer: email ? { email } : undefined,
  });

  return session;
}

export function verifyWebhook(body: string, headers: Record<string, string>) {
  const secret = process.env.DODO_WEBHOOK_KEY;
  if (!secret) throw new Error('DODO_WEBHOOK_KEY not set');

  const wh = new Webhook(secret);
  return wh.verify(body, headers);
}
