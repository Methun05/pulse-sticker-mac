/**
 * Shapes for the subset of the NOWPayments REST API (https://api.nowpayments.io/v1)
 * that we actually use. Based on NOWPayments' published API docs
 * (https://documenter.getpostman.com/view/7907941/S1a32n38) — not verified
 * against a live account, so field names/optionality here are a best-effort
 * match and should be double-checked against a real response the first time
 * this runs against production.
 */

export interface CreatePaymentRequest {
  /** Amount in `price_currency` (our side/fiat reference, e.g. "usd"). */
  price_amount: number;
  /** Currency the price is denominated in, e.g. "usd". */
  price_currency: string;
  /** Crypto currency the buyer will actually pay in, e.g. "usdttrc20", "bnbbsc", "pls". */
  pay_currency: string;
  /** Our internal identifier for this payment (project/bid), echoed back in the IPN. */
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
}

export interface CreatePaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string;
  created_at?: string;
  updated_at?: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

/**
 * Payload NOWPayments POSTs to our IPN callback. `payment_status`
 * progresses through values like "waiting" -> "confirming" -> "confirmed"
 * -> "finished" (or "failed"/"expired"/"refunded"). We treat "confirmed"
 * and "finished" both as a settled payment, since NOWPayments' own docs
 * are a little inconsistent about which is the final terminal state.
 */
export interface IpnPayload {
  payment_id: string | number;
  payment_status: string;
  pay_address?: string;
  price_amount?: number;
  price_currency?: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  created_at?: string;
  updated_at?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  [key: string]: unknown;
}
