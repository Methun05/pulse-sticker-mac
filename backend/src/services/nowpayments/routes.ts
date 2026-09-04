import { Router } from "express";

export const nowPaymentsRouter = Router();

// TODO(nowpayments): POST /create-payment — create an invoice via the
// NOWPayments API for a given bid (amount, token, project name).
// TODO(nowpayments): POST /ipn — receive and verify NOWPayments' IPN
// webhook (HMAC signature check against NOWPAYMENTS_IPN_SECRET), then
// upsert a PaymentRecord via paymentStore.
// See context/context.md section 3.1 / 4 for the reasoning.
