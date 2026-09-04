import { ethers } from "ethers";
import { config } from "../../config";

/**
 * Stateless, single-transaction PulseChain payment verifier.
 *
 * Deliberately NOT a chain-watcher/indexer (see context/context.md 3.4): every
 * call is exactly one on-demand check of one already-known tx hash — one
 * `getTransaction`, one `getTransactionReceipt`, one `getBlockNumber`, and
 * (for ERC-20 tokens) one `decimals()` read. No subscriptions, no polling
 * loop, no persisted chain state.
 */

export type ExpectedToken = "pls" | "pdai" | "usdc" | "usdt";

export interface VerifyPaymentParams {
  txHash: string;
  expectedToken: ExpectedToken;
  /** Human-readable decimal string, e.g. "100" or "12.5". */
  expectedAmount: string;
  projectName: string;
}

export type VerifyPaymentResult =
  | {
      status: "confirmed";
      /** Actual amount transferred, human-readable (may exceed expectedAmount). */
      amount: string;
      confirmations: number;
      blockNumber: number;
      from: string;
      to: string;
    }
  | {
      status: "pending";
      confirmations: number;
      requiredConfirmations: number;
    }
  | {
      status: "failed";
      reason: string;
    };

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
];

const erc20Interface = new ethers.Interface(ERC20_ABI);

function getProvider(): ethers.JsonRpcProvider {
  // Passing the chain id lets ethers skip a network-detection round trip.
  return new ethers.JsonRpcProvider(config.pulsechain.rpcUrl, config.pulsechain.chainId);
}

function tokenContractAddress(token: Exclude<ExpectedToken, "pls">): string {
  return config.pulsechain.tokenContracts[token];
}

/**
 * Runs the one-shot verification. Only throws for genuine unexpected
 * failures (RPC unreachable, malformed hash, etc.) — every expected
 * business-logic outcome (wrong amount/token/recipient, not enough
 * confirmations, unconfigured token) is returned as a normal result.
 */
export async function verifyPulsechainPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  const { txHash, expectedToken, expectedAmount } = params;

  const provider = getProvider();

  const [tx, receipt] = await Promise.all([
    provider.getTransaction(txHash),
    provider.getTransactionReceipt(txHash),
  ]);

  if (!tx) {
    return { status: "failed", reason: "Transaction not found on PulseChain (wrong hash, or not yet broadcast)." };
  }

  if (!receipt) {
    // Known to the mempool/node but not mined into a block yet.
    return { status: "pending", confirmations: 0, requiredConfirmations: config.pulsechain.minConfirmations };
  }

  if (receipt.status === 0) {
    return { status: "failed", reason: "Transaction reverted on-chain." };
  }

  let actualAmountRaw: bigint;
  let from: string;
  let to: string;
  // Only meaningful for ERC-20 tokens; PLS amounts are formatted with 18
  // fixed decimals via ethers.formatEther below.
  let tokenDecimals = 18;

  if (expectedToken === "pls") {
    if (!config.pulsechain.receivingWalletAddress) {
      return { status: "failed", reason: "Receiving wallet address is not configured." };
    }
    if (!tx.to || tx.to.toLowerCase() !== config.pulsechain.receivingWalletAddress.toLowerCase()) {
      return { status: "failed", reason: "Transaction recipient does not match the receiving wallet." };
    }

    let expectedAmountRaw: bigint;
    try {
      expectedAmountRaw = ethers.parseEther(expectedAmount);
    } catch {
      return { status: "failed", reason: `Invalid expectedAmount "${expectedAmount}" for PLS.` };
    }

    if (tx.value < expectedAmountRaw) {
      return {
        status: "failed",
        reason: `Amount too low: sent ${ethers.formatEther(tx.value)} PLS, expected at least ${expectedAmount} PLS.`,
      };
    }

    actualAmountRaw = tx.value;
    from = tx.from;
    to = tx.to;
  } else {
    const contractAddress = tokenContractAddress(expectedToken);
    if (!contractAddress) {
      return {
        status: "failed",
        reason: `${expectedToken.toUpperCase()} on PulseChain is not yet configured — contract address not confirmed. See context/context.md section 3.2/5.`,
      };
    }
    if (!config.pulsechain.receivingWalletAddress) {
      return { status: "failed", reason: "Receiving wallet address is not configured." };
    }

    // Find the Transfer log emitted by the expected token contract.
    let matchedTransfer: { from: string; to: string; value: bigint } | undefined;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
      try {
        const parsed = erc20Interface.parseLog(log);
        if (parsed && parsed.name === "Transfer") {
          matchedTransfer = {
            from: parsed.args.from as string,
            to: parsed.args.to as string,
            value: parsed.args.value as bigint,
          };
          break;
        }
      } catch {
        // Not a Transfer log (or not decodable with this ABI) — skip.
        continue;
      }
    }

    if (!matchedTransfer) {
      return {
        status: "failed",
        reason: `No ${expectedToken.toUpperCase()} Transfer event found in this transaction's logs.`,
      };
    }

    if (matchedTransfer.to.toLowerCase() !== config.pulsechain.receivingWalletAddress.toLowerCase()) {
      return { status: "failed", reason: "Token transfer recipient does not match the receiving wallet." };
    }

    // Read decimals live from the contract rather than assuming 18 (or any
    // fixed value) — bridged/wrapped tokens on PulseChain aren't guaranteed
    // to match their canonical-chain counterpart's decimals.
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const decimals: number = Number(await contract.decimals());

    let expectedAmountRaw: bigint;
    try {
      expectedAmountRaw = ethers.parseUnits(expectedAmount, decimals);
    } catch {
      return { status: "failed", reason: `Invalid expectedAmount "${expectedAmount}" for ${expectedToken.toUpperCase()}.` };
    }

    if (matchedTransfer.value < expectedAmountRaw) {
      return {
        status: "failed",
        reason: `Amount too low: sent ${ethers.formatUnits(matchedTransfer.value, decimals)} ${expectedToken.toUpperCase()}, expected at least ${expectedAmount} ${expectedToken.toUpperCase()}.`,
      };
    }

    actualAmountRaw = matchedTransfer.value;
    from = matchedTransfer.from;
    to = matchedTransfer.to;
    tokenDecimals = decimals;
  }

  const currentBlock = await provider.getBlockNumber();
  const confirmations = receipt.blockNumber != null ? currentBlock - receipt.blockNumber + 1 : 0;

  if (confirmations < config.pulsechain.minConfirmations) {
    return {
      status: "pending",
      confirmations,
      requiredConfirmations: config.pulsechain.minConfirmations,
    };
  }

  const amount =
    expectedToken === "pls" ? ethers.formatEther(actualAmountRaw) : ethers.formatUnits(actualAmountRaw, tokenDecimals);

  return {
    status: "confirmed",
    amount,
    confirmations,
    blockNumber: receipt.blockNumber,
    from,
    to,
  };
}
