# Project Context & Decisions Log

> Purpose: capture research, decisions, and the reasoning behind them so we never have to re-derive this from scratch. Update this file whenever a real decision is made or an assumption is proven right/wrong — treat it as the source of truth for "why did we choose this," not the code comments.

Related: [`BUSINESS_PLAN.md`](../BUSINESS_PLAN.md) for the product/business concept.

---

## 1. What this project is

A one-page site where PulseChain community projects pay crypto to rank on a leaderboard; top ranks get a physical sticker on a real MacBook (photo proof posted on social media). Ranking = who paid the most. See `BUSINESS_PLAN.md` for full details, revenue projections, and go-to-market plan.

This document only covers the **payments architecture** and the reasoning that led to it, plus the overall repo structure.

---

## 2. Payments: the core problem

We need to accept:
- **PLS** (PulseChain's native coin) — the flagship, most-community-relevant asset.
- **USDC / USDT / BNB** on the "normal" chains (Ethereum, BSC, Solana, Polygon).
- **USDC / USDT / DAI (as "pDAI")** *on PulseChain itself* — the part that turned out to be hard.

Requirement from the founder: after someone pays, the **backend must automatically verify** the payment (right token, right amount, right recipient) — not a human manually eyeballing a block explorer for every payment. And whatever we build must be **low/near-zero maintenance** — a past attempt at a custom payment processor was painful to keep running and "often failed."

---

## 3. Key research findings

### 3.1 NOWPayments (chosen for mainstream chains)
- Confirmed supported: **PLS** (native, dedicated PulseChain payment page), **USDT, USDC, BNB** — but USDC/USDT support is on **Ethereum, BSC, Solana, Polygon, Tron**, not on PulseChain itself.
- Fee: ~0.5% (cheaper than Coinbase Commerce's 1%).
- Fully hosted: handles invoice creation + auto payment confirmation via **IPN webhook** — zero chain-watching code needed on our side for the chains/tokens it covers.
- **HEX** is listed as a supported currency, but this is very likely the **original Ethereum HEX**, not PulseChain-native HEX (pHEX) — these are different contracts with different addresses. Never assume interchangeability; confirm with NOWPayments support directly before relying on it.
- They have an asset-listing request form (nowpayments.io/asset-listing) if we ever want to lobby for PulseChain-native token support — free to submit, no guaranteed outcome/timeline, not worth blocking on.

### 3.2 Why PulseChain-native stablecoins are NOT a simple "just add the token" problem
- **Circle has not officially issued USDC on PulseChain.** (Confirmed against Circle's official supported-network list — PulseChain is absent.)
- Because PulseChain is a fork of Ethereum, **anything called "USDC" on PulseChain is one of:**
  1. A **frozen fork-copy** of Ethereum's original USDC balance table, living at Ethereum USDC's original contract address — NOT backed by real reserves, essentially a worthless snapshot artifact.
  2. A **bridged/wrapped token** minted by PulseChain's official bridge (locks real USDC on Ethereum, mints a wrapped version on PulseChain) — can have real value, but the contract address must come from the **official PulseChain bridge** (bridge.pulsechain.com), never assumed from a random explorer/DEX listing.
  3. A **scam impersonator** — anyone can deploy an ERC-20 named "USDC" on a PulseChain DEX.
- **Same caution applies to USDT and DAI ("pDAI") on PulseChain.**
- **Action required before accepting any PulseChain-native stablecoin as payment:** manually confirm the exact, legitimate contract address via the official PulseChain bridge UI/docs. This is a business/ops step, not something to guess or hardcode speculatively. **As of this writing, these addresses are NOT yet confirmed** — treat any address found via web search as unverified.

### 3.3 Alternatives considered and rejected
| Option | Verdict | Why |
|---|---|---|
| Coinbase Commerce | Rejected | 1% fee (2x NOWPayments), and the product is being shut down/folded into Coinbase Business after March 31, 2026. |
| BTCPay Server | Rejected | Genuinely 0% platform fee, but self-hosted — trades "processor fee" for "server you must maintain," which is the exact maintenance burden we're trying to avoid. Also no PulseChain support; EVM/USDC support is community-plugin-maintained, not core. |
| A dedicated "PulseChain payment gateway" | Doesn't exist | Checked the market; nothing mature exists for PulseChain-native tokens specifically. "PulsePay" (the name) belongs to unrelated products, not a PulseChain-specific gateway. |
| Moralis Streams / Alchemy Notify / QuickNode (managed webhook-on-chain-event services) | Not usable for PulseChain | Moralis has solid **RPC node** support for PulseChain (confirmed, reliable, paid tier available), but their **Streams (webhook) product does not list PulseChain as supported**. So there is no fully-managed "tell me when a PulseChain wallet receives a token" service today. |

**Conclusion: no vendor exists that automatically verifies PulseChain-native token payments for us. That piece has to be built.** The goal is to build it in a way that avoids the failure mode of the founder's previous attempt.

### 3.4 Why the previous custom payment processor likely kept failing
Almost certainly because it was built as a **persistent, always-on watcher/indexer** — subscribing to every block, tracking state, needing to catch up after any downtime, handling chain reorgs. That kind of 24/7 process is genuinely hard to keep alive reliably; it's a small ops project in itself.

**The actual requirement doesn't need that.** Verifying "did payment X for amount Y arrive at my address" is a single, stateless, on-demand check — not a continuously running process:
1. Buyer pays (via a connect-wallet-and-pay flow, or by sending manually).
2. We get **one transaction hash** — either returned instantly by the buyer's wallet (if they paid through our UI via WalletConnect) or pasted in manually.
3. Backend makes **one RPC call** (get transaction receipt, decode the ERC-20 `Transfer` log or native value) and checks: right token contract, right amount (≥ expected), right recipient (us), enough confirmations.
4. If it checks out, record the payment / update the leaderboard.

No persistent process. Nothing to crash or restart. Nothing to "catch up" on. This is the architecture we're building.

**Reliability fix vs. last time:** use a **paid/managed RPC provider** (Moralis's PulseChain RPC nodes — confirmed supported) instead of the free public `rpc.pulsechain.com` endpoint. Free public RPCs rate-limit and drop under load; that's a likely cause of past flakiness, separate from the architecture problem.

---

## 4. Decision: hybrid payments architecture

| Payment | How it's verified | Built by |
|---|---|---|
| PLS, USDC/USDT/BNB on Ethereum/BSC/Solana/Polygon | NOWPayments (hosted invoice + IPN webhook) | Vendor (NOWPayments) — thin integration only |
| PulseChain-native tokens (pDAI, PulseChain-bridged USDC/USDT once contract addresses are confirmed) | Our own stateless, single-transaction verifier, backed by a managed RPC (Moralis) | Us |

Frontend payment UX (once built): a connect-wallet flow (WalletConnect / wagmi) lets a buyer connect any wallet, pick token + chain (adding PulseChain as a custom EVM network — chain ID 369, RPC via a managed provider), and send the payment in one click. The returned transaction hash feeds directly into the stateless verifier above. WalletConnect itself does **not** verify anything — it's only the "connect and sign" UX layer; the backend still independently re-verifies every transaction before trusting it.

---

## 5. Open items / not yet decided

- [ ] **Confirm real, legitimate contract addresses** for PulseChain-native USDC, USDT, and pDAI via the official PulseChain bridge — required before the PulseChain verifier can go live for those tokens. Do not hardcode a guessed address.
- [ ] NOWPayments merchant account + API key (business/ops action).
- [ ] Receiving wallet address(es) — one per chain, or one EVM address reused across all EVM chains (PulseChain/ETH/BSC/Polygon can share an address since they're all EVM; Solana needs its own).
- [ ] Persistent storage choice for leaderboard/payment records (currently a simple JSON-file store as a v1 placeholder — swap for a real DB when it matters).
- [ ] Frontend: not started yet, intentionally deferred until backend payment flows are solid. Folder scaffolded and reserved.
- [ ] Domain name (candidates listed in `BUSINESS_PLAN.md`).

---

## 6. Implementation status

- ✅ Backend scaffold (Express + TypeScript, JSON-file payment store, config/env wiring).
- ✅ `backend/src/services/nowpayments/` — create-payment + IPN webhook (HMAC-SHA512 verified), built. Untested against a real NOWPayments account/API key — see code comments for assumptions that need a live smoke test (exact field names, IPN status strings, whether chain-suffixed currency tickers like `usdtbsc` are needed).
- ✅ `backend/src/services/pulsechain/` — stateless single-transaction `/verify` endpoint, built. Will correctly refuse `pdai`/`usdc`/`usdt` verification until their contract addresses are filled into `.env` (see section 5's open item) — this is intentional, not a bug.
- ⏳ Not started: frontend, leaderboard read API, connect-wallet-and-pay UX, real NOWPayments account, real receiving wallet address(es), managed PulseChain RPC provider (still defaults to the free public endpoint).

## 7. Repo structure

```
/
├── BUSINESS_PLAN.md
├── context/
│   └── context.md          # this file
├── backend/                # Node.js + TypeScript + Express API
│   └── src/
│       ├── config/         # env/config loading
│       ├── routes/         # HTTP route definitions
│       ├── services/
│       │   ├── nowpayments/       # NOWPayments API client + IPN webhook handling
│       │   └── pulsechain/        # stateless PulseChain tx verifier
│       ├── store/          # payment/leaderboard record persistence (v1: JSON file)
│       ├── middleware/
│       └── types/
└── frontend/                # reserved, not started
```
