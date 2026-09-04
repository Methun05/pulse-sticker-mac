import crypto from "crypto";
import axios from "axios";
import { Request, Response } from "express";
import { config } from "../../config";
import { paymentStore } from "../../store/paymentStore";
import { PaymentRecord } from "../../types/payment";
import { createPayment } from "./client";
import { verifyIpnSignature } from "./ipnVerify";
import { IpnPayload } from "./types";

/** NOWPayments statuses we consider a fully-settled payment. */
const CONFIRMED_STATUSES = new Set(["finished", "confirmed"]);
/** NOWPayments statuses we consider terminally failed (won't settle later). */
const FAILED_STATUSES = new Set(["failed", "expired", "refunded"]);

const PRICE_CURRENCY = "usd";

interface CreatePaymentBody {
  projectName?: unknown;
  amount?: unknown;
  currency?: unknown;
}

export async function createPaymentHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { projectName, amount, currency } = req.body as CreatePaymentBody;

  if (
    typeof projectName !== "string" ||
    projectName.trim().length === 0 ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof currency !== "string" ||
    currency.trim().length === 0
  ) {
    res.status(400).json({
      error:
        "Body must include projectName (string), amount (positive number), and currency (string).",
    });
    return;
  }

  // Unique order id so we can trace this bid back through NOWPayments'
  // dashboard/IPN, and so paymentStore.upsert() has a stable key for the
  // "pending" record created here before the IPN confirms it.
  const orderId = `${slugify(projectName)}-${crypto.randomUUID()}`;

  try {
    const payment = await createPayment({
      price_amount: amount,
      price_currency: PRICE_CURRENCY,
      pay_currency: currency.toLowerCase(),
      order_id: orderId,
      order_description: `Pulse Sticker leaderboard bid: ${projectName}`,
    });

    const record: PaymentRecord = {
      id: crypto.randomUUID(),
      source: "nowpayments",
      reference: String(payment.payment_id),
      token: payment.pay_currency,
      amount: String(payment.pay_amount),
      projectName,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    paymentStore.upsert(record);

    res.status(201).json({
      paymentId: payment.payment_id,
      depositAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency,
      priceAmount: payment.price_amount,
      priceCurrency: payment.price_currency,
      orderId: payment.order_id,
      paymentStatus: payment.payment_status,
    });
  } catch (err) {
    res.status(502).json({
      error: "Failed to create payment with NOWPayments.",
      details: extractErrorMessage(err),
    });
  }
}

export function ipnHandler(req: Request, res: Response): void {
  const signature = req.header("x-nowpayments-sig");
  const isValid = verifyIpnSignature(
    req.body,
    signature,
    config.nowPayments.ipnSecret
  );

  if (!isValid) {
    res.status(401).json({ error: "Invalid IPN signature." });
    return;
  }

  const payload = req.body as IpnPayload;
  const paymentId = String(payload.payment_id);
  const status = (payload.payment_status ?? "").toLowerCase();

  const existing = paymentStore.findByReference(paymentId);

  const record: PaymentRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    source: "nowpayments",
    reference: paymentId,
    token: payload.pay_currency ?? existing?.token ?? "",
    amount: String(
      payload.actually_paid ?? payload.pay_amount ?? existing?.amount ?? ""
    ),
    projectName: existing?.projectName ?? extractProjectName(payload.order_id),
    status: CONFIRMED_STATUSES.has(status)
      ? "confirmed"
      : FAILED_STATUSES.has(status)
        ? "failed"
        : "pending",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    confirmedAt: CONFIRMED_STATUSES.has(status)
      ? new Date().toISOString()
      : existing?.confirmedAt,
  };

  paymentStore.upsert(record);

  res.status(200).json({ received: true });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Best-effort recovery of the project name from our own `order_id` shape. */
function extractProjectName(orderId: string | undefined): string {
  if (!orderId) {
    return "unknown";
  }
  const withoutUuidSuffix = orderId.replace(
    /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ""
  );
  return withoutUuidSuffix || orderId;
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.data) {
      return typeof err.response.data === "string"
        ? err.response.data
        : JSON.stringify(err.response.data);
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}
