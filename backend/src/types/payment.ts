export type PaymentSource = "nowpayments" | "pulsechain";

export type PaymentStatus = "pending" | "confirmed" | "failed";

export interface PaymentRecord {
  id: string;
  source: PaymentSource;
  /** On-chain tx hash (pulsechain) or provider payment id (nowpayments). */
  reference: string;
  token: string;
  amount: string;
  /** Bidder/project this payment is attributed to. */
  projectName: string;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
}
