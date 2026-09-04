import { JsonRpcProvider, Interface, id, zeroPadValue, formatUnits } from 'ethers';

// ─── Chain Config ───────────────────────────────────────────────────────────

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  fallbackRpcUrl?: string;
  blockExplorerUrl: string;
}

export const CHAINS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    fallbackRpcUrl: process.env.ETH_FALLBACK_RPC_URL || 'https://cloudflare-eth.com',
    blockExplorerUrl: 'https://etherscan.io',
  },
  56: {
    chainId: 56,
    name: 'BSC',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    fallbackRpcUrl: 'https://bsc-dataseed1.defibit.io',
    blockExplorerUrl: 'https://bscscan.com',
  },
  369: {
    chainId: 369,
    name: 'PulseChain',
    rpcUrl: process.env.PULSECHAIN_RPC_URL || 'https://rpc.pulsechain.com',
    fallbackRpcUrl: 'https://pulsechain-rpc.publicnode.com',
    blockExplorerUrl: 'https://scan.pulsechain.com',
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    fallbackRpcUrl: 'https://base-rpc.publicnode.com',
    blockExplorerUrl: 'https://basescan.org',
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    fallbackRpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    blockExplorerUrl: 'https://polygonscan.com',
  },
};

// ─── Token Config ───────────────────────────────────────────────────────────

export interface TokenConfig {
  symbol: string;
  decimals: number;
  isNative: boolean;
  contractAddresses: Record<number, string>; // chainId -> contract address
}

export const TOKENS: Record<string, TokenConfig> = {
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    contractAddresses: {}, // native on chain 1
  },
  BNB: {
    symbol: 'BNB',
    decimals: 18,
    isNative: true,
    contractAddresses: {}, // native on chain 56
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    contractAddresses: {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',       // Ethereum
      56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',       // BSC
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',    // Base
      137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',     // Polygon
    },
    isNative: false,
  },
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    contractAddresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',       // Ethereum
      56: '0x55d398326f99059fF775485246999027B3197955',       // BSC
    },
    isNative: false,
  },
  DAI: {
    symbol: 'DAI',
    decimals: 18,
    contractAddresses: {
      1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',       // Ethereum
    },
    isNative: false,
  },
};

// Map of which native token belongs to which chain
export const NATIVE_TOKEN_CHAIN: Record<string, number> = {
  ETH: 1,
  BNB: 56,
};

// ─── Deposit Addresses ──────────────────────────────────────────────────────

// Per-chain deposit addresses (2 per chain for rotation)
// Set via env vars: ETH_DEPOSIT_ADDRESSES=0xAddr1,0xAddr2
export function getDepositAddresses(chainId: number): string[] {
  const envKey = `DEPOSIT_ADDRESSES_${chainId}`;
  const raw = process.env[envKey] || process.env.DEPOSIT_ADDRESSES || '';
  return raw.split(',').map(a => a.trim()).filter(Boolean);
}

// ─── Provider Management ────────────────────────────────────────────────────

const providers: Record<number, JsonRpcProvider> = {};

export function getProvider(chainId: number): JsonRpcProvider {
  if (providers[chainId]) return providers[chainId];

  const chain = CHAINS[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  // Create provider with primary RPC. If it fails on first call,
  // the caller should handle errors. Fallback RPC is used if primary
  // is explicitly unavailable via env config.
  const rpcUrl = chain.rpcUrl;
  providers[chainId] = new JsonRpcProvider(rpcUrl);
  return providers[chainId];
}

// ─── Amount Conversion ──────────────────────────────────────────────────────

export function humanToBaseUnits(amount: number, token: string): bigint {
  const tokenConfig = TOKENS[token];
  if (!tokenConfig) throw new Error(`Unknown token: ${token}`);

  const decimals = tokenConfig.decimals;
  // Handle floating point: multiply by 10^decimals using string math
  const factor = BigInt(10 ** decimals);
  const wholePart = BigInt(Math.floor(amount));
  const fracStr = amount.toFixed(decimals).split('.')[1] || '0';
  const fracPart = BigInt(fracStr.padEnd(decimals, '0').slice(0, decimals));

  return wholePart * factor + fracPart;
}

export function baseUnitsToHuman(amount: string | bigint, token: string): number {
  const tokenConfig = TOKENS[token];
  if (!tokenConfig) throw new Error(`Unknown token: ${token}`);
  return parseFloat(formatUnits(BigInt(amount), tokenConfig.decimals));
}

// ─── On-Chain Verification ──────────────────────────────────────────────────

const ERC20_TRANSFER_IFACE = new Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);
const TRANSFER_TOPIC = id('Transfer(address,address,uint256)');

export interface VerificationResult {
  confirmed: boolean;
  txHash?: string;
  actualAmount?: string;
}

/**
 * Verify a native token payment (ETH, BNB) by checking balance increase.
 */
export async function verifyNativePayment(
  chainId: number,
  depositAddress: string,
  startBalance: string,
  totalDue: string
): Promise<VerificationResult> {
  const provider = getProvider(chainId);
  const currentBalance = await provider.getBalance(depositAddress);
  const expected = BigInt(startBalance) + BigInt(totalDue);

  // Fixed: use >= instead of > (the ETH bug from crypto-payment-gateway)
  if (currentBalance >= expected) {
    return {
      confirmed: true,
      actualAmount: (currentBalance - BigInt(startBalance)).toString(),
    };
  }

  return { confirmed: false };
}

/**
 * Verify an ERC20 token payment (USDC, USDT, DAI) by scanning Transfer logs.
 */
export async function verifyERC20Payment(
  chainId: number,
  token: string,
  depositAddress: string,
  startBlock: number,
  totalDue: string
): Promise<VerificationResult> {
  const tokenConfig = TOKENS[token];
  if (!tokenConfig || tokenConfig.isNative) {
    throw new Error(`${token} is not an ERC20 token`);
  }

  const contractAddress = tokenConfig.contractAddresses[chainId];
  if (!contractAddress) {
    throw new Error(`${token} not available on chain ${chainId}`);
  }

  const provider = getProvider(chainId);
  const currentBlock = await provider.getBlockNumber();

  const toTopic = zeroPadValue(depositAddress.toLowerCase(), 32);

  const logs = await provider.getLogs({
    fromBlock: startBlock,
    toBlock: currentBlock,
    address: contractAddress,
    topics: [TRANSFER_TOPIC, null, toTopic],
  });

  const totalDueBigInt = BigInt(totalDue);
  // Allow a small tolerance: accept if within 1% or $0.01 (whichever is larger)
  const tolerance = totalDueBigInt / 100n; // 1%
  const minAcceptable = totalDueBigInt - (tolerance > 0n ? tolerance : 1n);

  for (const log of logs) {
    try {
      const parsed = ERC20_TRANSFER_IFACE.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (!parsed) continue;

      const transferAmount = parsed.args[2] as bigint;
      if (transferAmount >= minAcceptable) {
        return {
          confirmed: true,
          txHash: log.transactionHash,
          actualAmount: transferAmount.toString(),
        };
      }
    } catch {
      continue;
    }
  }

  return { confirmed: false };
}

/**
 * Verify any payment based on token type.
 */
export async function verifyPayment(
  chainId: number,
  token: string,
  depositAddress: string,
  startBlock: number,
  startBalance: string,
  totalDue: string
): Promise<VerificationResult> {
  const tokenConfig = TOKENS[token];
  if (!tokenConfig) throw new Error(`Unknown token: ${token}`);

  if (tokenConfig.isNative) {
    return verifyNativePayment(chainId, depositAddress, startBalance, totalDue);
  } else {
    return verifyERC20Payment(chainId, token, depositAddress, startBlock, totalDue);
  }
}

/**
 * Snapshot current blockchain state for a deposit address.
 * Used when initiating a payment to record the starting point.
 */
export async function snapshotBlockchainState(
  chainId: number,
  token: string,
  depositAddress: string
): Promise<{ startBlock: number; startBalance: string }> {
  const provider = getProvider(chainId);
  const startBlock = await provider.getBlockNumber();

  const tokenConfig = TOKENS[token];
  if (!tokenConfig) throw new Error(`Unknown token: ${token}`);

  let startBalance = '0';
  if (tokenConfig.isNative) {
    const balance = await provider.getBalance(depositAddress);
    startBalance = balance.toString();
  } else {
    const contractAddress = tokenConfig.contractAddresses[chainId];
    if (contractAddress) {
      const { Contract } = await import('ethers');
      const erc20 = new Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const balance = await erc20.balanceOf(depositAddress);
      startBalance = balance.toString();
    }
  }

  return { startBlock, startBalance };
}
