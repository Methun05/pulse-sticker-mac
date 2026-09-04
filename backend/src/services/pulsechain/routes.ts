import { randomUUID } from "crypto";
import { Router } from "express";
import { config } from "../../config";
import { paymentStore } from "../../store/paymentStore";
import { PaymentRecord } from "../../types/payment";
import { ExpectedToken, verifyPulsechainPayment } from "./verify";

export const pulsechainRouter = Router();

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;
const VALID_TOKENS: ExpectedToken[] = ["pls", "pdai", "usdc", "usdt"];

interface VerifyRequestBody {
  txHash?: unknown;
  expectedToken?: unknown;
  expectedAmount?: unknown;
  projectName?: unknown;
}

/**
 * POST /verify — the ONLY endpoint here. Given a tx hash the buyer already
 * has, does one stateless on-chain check (see context/context.md 3.4: this
 * is deliberately the opposite of a persistent chain-watcher/indexer — no
 * polling, no background process, one request in, one response out).
 */
pulsechainRouter.post("/verify", async (req, res) => {
  const body = req.body as VerifyRequestBody;
  const { txHash, expectedToken, expectedAmount, projectName } = body;

  if (typeof txHash !== "string" || !TX_HASH_RE.test(txHash)) {
    return res.status(400).json({ error: "txHash must be a 0x-prefixed 32-byte transaction hash." });
  }
  if (typeof expectedToken !== "string" || !VALID_TOKENS.includes(expectedToken as ExpectedToken)) {
    return res.status(400).json({ error: `expectedToken must be one of: ${VALID_TOKENS.join(", ")}.` });
  }
  if (typeof expectedAmount !== "string" || expectedAmount.trim() === "" || Number(expectedAmount) <= 0) {
    return res.status(400).json({ error: "expectedAmount must be a positive numeric string." });
  }
  if (typeof projectName !== "string" || projectName.trim() === "") {
    return res.status(400).json({ error: "projectName is required." });
  }
  if (!config.pulsechain.receivingWalletAddress) {
    return res.status(500).json({ error: "Server misconfiguration: RECEIVING_WALLET_ADDRESS is not set." });
  }

  const token = expectedToken as ExpectedToken;

  // Idempotency: a payment already fully confirmed for this tx hash is
  // never re-verified — just hand back what we already recorded. A payment
  // still "pending" is deliberately allowed to fall through and be
  // re-verified below, so a later call with more confirmations can promote
  // it to "confirmed" without double-counting anything (upsert keyed by
  // reference, not a second record).
  const existing = paymentStore.findByReference(txHash);
  if (existing && existing.status === "confirmed") {
    return res.status(200).json({ record: existing, alreadyVerified: true });
  }

  let result;
  try {
    result = await verifyPulsechainPayment({ txHash, expectedToken: token, expectedAmount, projectName });
  } catch (err) {
    // Only genuine unexpected failures land here (RPC unreachable, etc.) —
    // every expected business-logic outcome is a normal return value.
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({ error: `Could not reach PulseChain RPC or verification failed unexpectedly: ${message}` });
  }

  if (result.status === "failed") {
    // Never persist a failed verification.
    return res.status(400).json({ error: result.reason });
  }

  if (result.status === "pending") {
    const record: PaymentRecord = {
      id: existing?.id ?? randomUUID(),
      source: "pulsechain",
      reference: txHash,
      token,
      amount: expectedAmount,
      projectName,
      status: "pending",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    paymentStore.upsert(record);
    return res.status(202).json({
      record,
      message: "Transaction found but does not yet have enough confirmations.",
      confirmations: result.confirmations,
      requiredConfirmations: result.requiredConfirmations,
    });
  }

  // result.status === "confirmed"
  const record: PaymentRecord = {
    id: existing?.id ?? randomUUID(),
    source: "pulsechain",
    reference: txHash,
    token,
    amount: result.amount,
    projectName,
    status: "confirmed",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
  };
  paymentStore.upsert(record);
  return res.status(200).json({ record });
});
