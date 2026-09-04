# Backend

Node.js + TypeScript + Express API for the PulseChain MacBook Sticker Board.

See [`../context/context.md`](../context/context.md) for the payments architecture and why it's built this way before changing anything here.

## Setup

```
npm install
cp .env.example .env   # fill in values — see comments in .env.example
npm run dev
```

## Structure

```
src/
├── config/            env/config loading
├── routes/            shared/misc HTTP routes (leaderboard, etc. — TBD)
├── services/
│   ├── nowpayments/   NOWPayments API client + IPN webhook (PLS, USDC/USDT/BNB
│   │                  on Ethereum/BSC/Solana/Polygon)
│   └── pulsechain/    stateless single-transaction verifier for
│                      PulseChain-native tokens (pDAI, bridged USDC/USDT)
├── store/             payment record persistence (v1: JSON file)
├── middleware/
└── types/
```
