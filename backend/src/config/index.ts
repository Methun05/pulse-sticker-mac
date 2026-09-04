import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: Number(requireEnv("PORT", "4000")),

  nowPayments: {
    apiKey: requireEnv("NOWPAYMENTS_API_KEY"),
    ipnSecret: requireEnv("NOWPAYMENTS_IPN_SECRET"),
    payoutWalletAddress: requireEnv("PAYOUT_WALLET_ADDRESS"),
  },

  pulsechain: {
    rpcUrl: requireEnv("PULSECHAIN_RPC_URL", "https://rpc.pulsechain.com"),
    chainId: Number(requireEnv("PULSECHAIN_CHAIN_ID", "369")),
    receivingWalletAddress: requireEnv("RECEIVING_WALLET_ADDRESS"),
    minConfirmations: Number(requireEnv("PULSECHAIN_MIN_CONFIRMATIONS", "6")),
    tokenContracts: {
      pdai: requireEnv("PULSECHAIN_PDAI_CONTRACT"),
      usdc: requireEnv("PULSECHAIN_USDC_CONTRACT"),
      usdt: requireEnv("PULSECHAIN_USDT_CONTRACT"),
    },
  },
};
