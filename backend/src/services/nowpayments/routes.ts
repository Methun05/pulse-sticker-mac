import { Router } from "express";
import { createPaymentHandler, ipnHandler } from "./controller";

export const nowPaymentsRouter = Router();

// Creates a NOWPayments invoice for a leaderboard bid and returns the
// deposit address/amount for the frontend to display.
nowPaymentsRouter.post("/create-payment", createPaymentHandler);

// NOWPayments' IPN webhook — fires as the payment progresses/settles.
// Verified via HMAC-SHA512 over the sorted JSON body (see ipnVerify.ts).
nowPaymentsRouter.post("/ipn", ipnHandler);
