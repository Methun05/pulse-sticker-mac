# PulseChain MacBook Sticker Board — Business Plan

> Pay-to-rank leaderboard where PulseChain projects pay crypto or fiat to get their logo stickered on a real MacBook. Higher payment = better placement. Physical proof + live leaderboard.

**Production URL**: https://pulse-sticker-mac.vercel.app

---

## 1. What Is This?

A one-page website with a live leaderboard. PulseChain projects (tokens, dApps, tools, meme coins) pay to rank on the board. The top-ranked projects get their logo physically stickered on a real MacBook lid. Every rank change gets documented with a photo.

This is NOT a directory. This is NOT a review site. The ranking is purely based on how much a project pays. No votes, no algorithm, no editorial picks.

---

## 2. How It Works

### For Projects (Buyers)

1. Visit the site, see the current leaderboard with MacBook lid + inside views
2. Click any spot on the MacBook mockup to place a bid
3. Fill in brand name, website, email, X handle, and upload a logo
4. Choose payment method: **Crypto** (via DePay) or **Fiat/Card** (via DoDo Payments)
5. Once payment is confirmed, your logo goes live on the board
6. Top 10 spots get a physical sticker on the real MacBook — photo proof posted on Twitter/X

### Ranking Rules

- Higher total paid = higher rank
- You can outbid anyone at any time — they slide down, you take their spot
- Minimum bid increment: $5 above current highest bid
- If you get outbid, you can pay more to reclaim your position
- This creates ongoing competition (and ongoing revenue)

### Spot Layout (18 Spots)

| Spots | Placement | Size | Starting Price |
|-------|-----------|------|---------------|
| #1 | Center Lid | XL | $5 |
| #2-3 | Upper Left/Right | Large | $3 |
| #4-8 | Mid + Lower Lid | Medium | $2 |
| #9-10 | Bottom Left/Right | Small | $1 |
| #11-18 | Inside view (flanking trackpad) | Medium | $2 |

All 18 spots are PHYSICAL tier — stickers go on the real MacBook (lid and inside).

---

## 3. Payment

### Dual Payment System (Crypto + Fiat)

#### Crypto — DePay (Live)
- **Provider**: [DePay](https://depay.com) — non-custodial, multi-chain crypto payments
- **How**: User clicks "Pay with Crypto" → DePay widget opens → pays from any wallet
- **Chains**: Ethereum, BSC, Base, Polygon
- **Tokens**: Any token on supported chains (DePay auto-converts via DEX routing)
- **Verification**: DePay sends signed callback to `/api/depay/callback` → atomic DB transaction confirms bid
- **Security**: RSA-PSS signature verification on all callbacks + response signing

#### Fiat/Card — DoDo Payments (Test Mode)
- **Provider**: [DoDo Payments](https://dodopayments.com) — checkout overlay for card/fiat
- **How**: User clicks "Pay with Fiat" → DoDo overlay opens → pays with card
- **Product**: "MacBook Spot Sponsorship" with Pay What You Want enabled (dynamic pricing per bid)
- **Verification**: DoDo sends webhook to `/api/dodo/webhook` → same atomic DB transaction as crypto
- **Security**: Standard Webhooks signature verification (`standardwebhooks` package)

### Payment Security (3 Layers)

1. **Atomic transactions**: All bid confirmation happens in a Prisma `$transaction` — fetch bid, guard checks, create Payment, mark outbids, update spot, recalculate totalRaised
2. **Signature verification**: Both DePay (RSA-PSS) and DoDo (Standard Webhooks) verify all incoming callbacks
3. **Idempotency**: Already-confirmed bids return success without re-processing
4. **Expiry**: Bids expire after 30 minutes if unpaid

### Payment Infrastructure — $0 Cost

| Component | What | Cost |
|-----------|------|------|
| Crypto payments | DePay (non-custodial, no fees to us) | $0 |
| Fiat payments | DoDo Payments (test mode, no fees yet) | $0 |
| Database | Neon PostgreSQL (serverless) | $0 — free tier |
| Hosting | Vercel | $0 — hobby plan |
| ORM | Prisma 5 | $0 |

### Phase 2: PulseChain-Native Tokens
- Add PulseChain RPC endpoint + PRC-20 token contract addresses
- DePay already supports multi-chain — just needs PulseChain chain config
- PLS, PLSX, HEX, pDAI, SOIL, PCOCK

---

## 4. Target Audience

### Who Would Pay?

| Segment | Why They'd Pay | Estimated Count |
|---------|---------------|-----------------|
| Meme coins (PCOCK, HOA, TWERK, etc.) | Visibility = volume. They NEED eyeballs to survive | 20-30 active |
| DEXs (PulseX community, RichardSwap, SparkSwap) | Compete for traders | 5-10 |
| DeFi protocols (Liquid Loans, Earn, SuperStake) | User acquisition | 10-15 |
| Tools & trackers (ChingChing, Phatty, HowToPulse) | Brand awareness | 5-10 |
| New token launches | Day-1 awareness in the community | Ongoing |
| NFT projects (PulseMarket, Mintra) | Hype + mints | 5-10 |
| Infra & bridges (Pulse Wallet, TokensExpress) | Credibility | 3-5 |

**Total addressable market: ~50-100 active PulseChain projects**

### Why They'd Care

- The PulseChain community is tribal — they love repping their ecosystem
- "Our token is #1 on the MacBook" is tweetable content for THEM
- Physical sticker = real-world proof, not just another digital ad
- It's cheap — $5-50 is nothing for a project's marketing budget
- Fiat option lowers the barrier — no wallet needed
- Outbid wars create drama and engagement — free marketing for everyone

---

## 5. Revenue Projections

### Conservative Estimate

| Scenario | Projects | Avg Bid | Revenue |
|----------|----------|---------|---------|
| Soft launch (month 1) | 10-15 | $5-10 | $50-150 |
| Growing (month 2-3) | 20-30 | $10-30 | $200-900 |
| Outbid wars kick in | 5-10 top spots | $50-100+ each | $250-1,000+ |
| Steady state | 30-50 total | Mixed | $500-2,000 total |

### Realistic ceiling
- PulseChain is a niche community (~40K in main Telegram)
- Total lifetime revenue: **$500-3,000** unless it goes viral beyond PulseChain
- This is a fun side project with real revenue, not a full business

### Revenue upside triggers
- Richard Heart or a major PulseChain account tweets about it
- Outbid war between rival meme coins goes viral
- Concept gets picked up by crypto Twitter beyond PulseChain

---

## 6. Go-to-Market Strategy

### Where the PulseChain community lives

| Channel | Size | Type |
|---------|------|------|
| Telegram (@PulsechainCom) | ~40K members | Main community hub |
| Twitter/X | Largest surface area | @RichardHeartWin, @HowtoPulse, @PulsessorHex, project accounts |
| Reddit (r/Pulsechain) | Active but smaller | Discussion/news |
| Discord | Fragmented, per-project | Direct outreach |
| YouTube | HowToPulse, various PLS creators | Content/reviews |

### Phase 1 — Seed (Before Public Launch)

**Goal: Get 3-5 projects on the board before anyone sees the site**

1. DM 5-10 PulseChain project founders/community managers directly
   - Start with meme coins (lowest barrier, most degen, most likely to say yes)
   - PCOCK, HOA, TWERK, PulseDogecoin — they thrive on visibility
2. Offer first 3 spots at a low floor ($1-5) to populate the board
3. Print their stickers, put them on the MacBook, take a high-quality photo
4. This photo IS the marketing material for Phase 2

### Phase 2 — Launch

**Goal: Public awareness in the PulseChain community**

5. Tweet the stickered MacBook photo + link to the site
   - Tag every project already on the board (they'll RT because they paid for it)
   - Use community hashtags: #PulseChain #HEX #Hexican
6. Post in PulseChain Telegram (40K members)
   - Frame it as fun/community, not an ad
   - "PulseChain projects are fighting for the #1 spot on my MacBook"
7. Post on r/Pulsechain
8. DM more project founders — now you have social proof (board isn't empty)

### Phase 3 — Growth Loop

**Goal: Self-sustaining attention through outbid wars**

9. Every time someone outbids, tweet it
   - "PCOCK just overtook HEX for the #1 spot on the MacBook"
   - This creates drama, engagement, and FOMO for other projects
10. Weekly "leaderboard update" photo posts on Twitter
11. Projects share their ranking on their own channels (free distribution)
12. Bring the MacBook to crypto meetups/events — walking billboard

### Phase 4 — Expand (Optional)

- Add a second MacBook (if first one fills up)
- Merch: stickered MacBook phone case, stickered desk setup
- Partner with PulseChain influencers for co-branded boards
- Open it up to other chains (Ethereum, Solana) with separate boards

---

## 7. Competitive Landscape

| Competitor | What They Do | Why We're Different |
|-----------|-------------|-------------------|
| brandmylaptop.com | Marketplace for laptop sticker ads | Generic marketplace, fiat only, no community focus, no ranking |
| airframe.lol | Pay to rank on glasses | Not crypto-native, not community-specific |
| brandmybaby.lol | Bid on 3D baby spots | Meme/satire, not real physical object |
| topfloor.company | Generic pay-to-rank board | No physical component, no community |
| thronetax.com | Crypto pay-to-rank (ETH/SOL/BTC) | Not PulseChain, no physical sticker angle |
| pulsecoinlist.com | PulseChain project directory | Free listing, no ranking by payment |

**Our unique combo: PulseChain-native + pay-to-rank + physical MacBook stickers + dual crypto/fiat payments + community-driven**

---

## 8. What We Built

### Tech Stack (Actual)

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 15 + Tailwind 4 + Motion | Apple-inspired light theme |
| Crypto Payments | DePay | Multi-chain, non-custodial, widget-based |
| Fiat Payments | DoDo Payments | Overlay checkout, card payments |
| Database | Neon PostgreSQL | Serverless Postgres, free tier |
| ORM | Prisma 5 | Type-safe DB access |
| Hosting | Vercel | Hobby plan, $0 |
| Analytics | Vercel Analytics | Built-in |

### Architecture

```
Frontend (Next.js 15)
├── MacBook Mockup (Lid + Inside views, CSS-based)
├── BidModal (form → payment → logo upload → done)
├── SpotCards + Leaderboard
├── Hero, How It Works, FAQ sections
└── Admin panel

API Routes
├── /api/board — GET board state + spots
├── /api/bid/create — POST create bid (AWAITING_PAYMENT)
├── /api/depay/callback — POST DePay payment confirmation
├── /api/depay/configuration — GET DePay widget config
├── /api/depay/event — POST DePay event logging
├── /api/dodo/checkout — POST create DoDo checkout session
├── /api/dodo/webhook — POST DoDo payment confirmation
├── /api/upload — POST logo upload (with token auth)
├── /api/admin — CRUD admin operations
└── /api/analytics/view — POST page view tracking

Database (Prisma/Neon)
├── Board (title, status, totalRaised)
├── Spot (number, position, size, currentBid, currentBrandName, ...)
├── Bid (amount, status, brandName, walletAddress, ...)
├── Payment (txHash, chainId, token, usdAmount, ...)
└── AdminConfig (siteActive, pageViews)
```

### MacBook Mockup Architecture
- **Lid View**: CSS gradient aluminum surface (aspect-ratio 1.44), Apple logo SVG, 6-col x 3-row spot grid
- **Inside View**: Real photo overlay with spots flanking the trackpad
- **View Toggle**: Pill-style Lid/Inside switcher
- **Responsive**: Uses CSS `--lidw` var via ResizeObserver

### Bid Flow
```
1. User clicks spot → BidModal opens
2. Fills form (brand, website, email, X handle, logo, bid amount)
3. Clicks "Pay with Crypto" or "Pay with Fiat"
4. POST /api/bid/create → returns bidId + uploadToken
5a. Crypto: DePay widget opens → user pays → DePay callback confirms
5b. Fiat: DoDo checkout overlay opens → user pays with card → DoDo webhook confirms
6. Both paths: atomic $transaction confirms bid, updates spot, recalculates board
7. User proceeds to logo upload step → done
```

### Design
- Apple-inspired light theme (white body, clean typography)
- Style reference: megapot.io + brandmylaptop.com
- Font: Space Grotesk
- PulseChain green: #00ff55
- UI library: Watermelon UI (copy-paste components)
- Rounded cards, subtle shadows, minimal borders

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Not enough projects care | Low revenue, dead board | Seed with 3-5 projects before launch, keep floor prices very low |
| PulseChain community too small | Revenue ceiling hit quickly | This is a side project, not a full business. $500+ is a win |
| Community backlash ("cash grab") | Negative perception | Frame as fun/community, keep it light and transparent |
| PLS price crashes | Revenue worth less in USD | Fiat option available, stablecoin payments via DePay |
| Sticker logistics annoying | Operational friction | Only top 10 get physical stickers on lid, rest are inside view |
| Someone copies the idea | Competition | First mover advantage + your personal brand in the community |
| Richard Heart or major account calls it out negatively | Reputation hit | Stay community-positive, don't overpromise, be transparent |

---

## 10. Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Projects on board | 20+ |
| Total revenue | $500+ |
| Twitter impressions from sticker posts | 10K+ |
| Outbid events | 10+ (proves competitive dynamic works) |
| Community sentiment | Positive/fun (not seen as spam) |

---

## 11. Build Progress

| Milestone | Status |
|-----------|--------|
| Backend: Prisma schema, all API routes, crypto verification | Done |
| Deployed to Vercel, Neon DB connected | Done |
| Board API live, 18 spots bootstrapped | Done |
| Payment initiate/status endpoints | Done |
| Admin routes (pause/resume/reset/update prices) | Done |
| Security: atomic transactions, signature verification, bid expiry | Done |
| Frontend: Apple-inspired light theme | Done |
| MacBook mockup: Lid view (CSS gradient + spot grid) | Done |
| MacBook mockup: Inside view (real photo + spots) | Done |
| Lid/Inside toggle with pill switcher | Done |
| BidModal: full bid flow (form, payment, logo upload, done) | Done |
| DePay crypto integration (widget + callbacks) | Done |
| DoDo fiat integration (overlay checkout + webhooks) | Done |
| Logo upload with token-based auth | Done |
| Page view analytics | Done |
| Admin panel | Needs rewire to new API |
| Real deposit addresses | Placeholder — needs real wallets |
| DoDo product setup | In progress (test mode) |
| Seed outreach to PulseChain projects | Not started |
| Public launch | Not started |

---

## 12. Summary

A pay-to-rank MacBook sticker leaderboard built for the PulseChain community. Projects pay via crypto (DePay, multi-chain) or fiat/card (DoDo Payments) to rank higher. 18 spots on a real MacBook (lid + inside). Top projects get physical stickers with photo proof. The competitive outbid dynamic creates ongoing engagement and revenue. Built with Next.js 15, Prisma, Neon PostgreSQL on Vercel. Launch strategy targets PulseChain's concentrated community channels (Telegram 40K, Twitter, Reddit). Realistic revenue: $500-3,000. Zero infrastructure cost, pure profit from day one.
