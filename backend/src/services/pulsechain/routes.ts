import { Router } from "express";

export const pulsechainRouter = Router();

// TODO(pulsechain): POST /verify — given a { txHash, expectedToken,
// expectedAmount, projectName }, run ONE stateless on-chain check (no
// persistent watcher — see context/context.md section 3.4): fetch the tx
// receipt, confirm recipient/token/amount/confirmations, then upsert a
// PaymentRecord via paymentStore.
