# PulseChain MacBook Sticker Board — Business Plan

> Pay-to-rank leaderboard where PulseChain projects pay in USDC, USDT, ETH, DAI, or BNB to get their logo stickered on a real MacBook. Higher payment = better placement. Physical proof + live leaderboard.

---

## 1. What Is This?

A one-page website with a live leaderboard. PulseChain projects (tokens, dApps, tools, meme coins) pay crypto to rank on the board. The top-ranked projects get their logo physically stickered on a real MacBook lid. Every rank change gets documented with a photo.

This is NOT a directory. This is NOT a review site. The ranking is purely based on how much a project pays. No votes, no algorithm, no editorial picks.

---

## 2. How It Works

### For Projects (Buyers)

1. Visit the site, see the current leaderboard
2. Pick a spot or outbid someone above you
3. Send PLS or DAI (on PulseChain) to the payment wallet
4. Once tx is verified, your logo goes on the board
5. Top spots get a physical sticker on the MacBook — photo proof posted on Twitter/X

### Ranking Rules

- Higher total paid = higher rank
- You can outbid anyone at any time — they slide down, you take their spot
- If you get outbid, you can pay more to reclaim your position
- This creates ongoing competition (and ongoing revenue)

### Sticker Tiers

| Rank | Placement | Sticker Size |
|------|-----------|-------------|
| #1 | Center of MacBook lid | XL (biggest, most visible) |
| #2-3 | Upper lid, flanking center | Large |
| #4-6 | Mid lid | Medium |
| #7-10 | Lower lid / edges | Small |
| #11+ | Leaderboard only, no physical sticker | Digital only |

When rankings change, stickers get physically rearranged and a new photo is posted as proof.

---

## 3. Payment

### Accepted Tokens (v1)
- **USDC** (Ethereum, Base, Polygon)
- **USDT** (Ethereum, Tron, BSC)
- **ETH** (Ethereum mainnet)
- **DAI** (Ethereum)
- **BNB** (BSC)

> PulseChain-native tokens (PLS, PLSX, HEX) deferred to Phase 2 — standard EVM tokens first for simplicity.

### Payment Infrastructure — $0 Cost

**Based on**: [3aLaee/crypto-payment-gateway](https://github.com/3aLaee/crypto-payment-gateway) (open source, MIT)

| Component | What | Cost |
|-----------|------|------|
| Payment API | Next.js API routes (drop-in from crypto-payment-gateway) | $0 — part of our Next.js app |
| On-chain verification | Backend polls blockchain RPC to confirm tx | $0 — free public RPCs |
| Database | Supabase (orders, payment status, leaderboard) | $0 — free tier (50K rows) |
| Hosting | Vercel | $0 — hobby plan |
| Payment provider fees | None — direct wallet-to-wallet | $0 |

**How it works:**
```
1. User clicks "Bid $10" → POST /api/payment/initiate
   → Returns deposit address + order ID

2. User sends USDC/USDT/ETH to deposit address from any wallet

3. Backend polls GET /api/payment/status?orderId=xxx
   → Checks blockchain via RPC (Transfer event logs for ERC20, balance for native)
   → When confirmed → marks "paid" in Supabase

4. Leaderboard auto-updates from Supabase data
```

**Why not a payment provider?**
- NOWPayments (0.5-1% fees, doesn't support PulseChain tokens for Phase 2)
- Payram ($20-40/mo server cost)
- Stripe Crypto (no PulseChain, limited tokens)
- DIY is $0, runs on Vercel for free, and we have an open source template

### Phase 2: Add PulseChain tokens
- Add PulseChain RPC endpoint + PRC-20 token contract addresses
- Same code pattern — just different RPC URL and chain ID
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
- It's cheap — $5-50 in PLS is nothing for a project's marketing budget
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

**Our unique combo: PulseChain-native + pay-to-rank + physical MacBook stickers + community-driven**

Nobody has put these four things together.

---

## 8. What We Need to Build

### Tech Stack

| Layer | Technology | Source |
|-------|-----------|--------|
| Frontend | Next.js 14 + Tailwind CSS | Forked from [dpratyush02/brandmylaptop](https://github.com/dpratyush02/brandmylaptop) |
| Payment API | Next.js API routes | Integrated from [3aLaee/crypto-payment-gateway](https://github.com/3aLaee/crypto-payment-gateway) |
| Database | Supabase (Postgres) | Free tier |
| Hosting | Vercel | Free tier |
| Blockchain RPC | Public endpoints (Ethereum, BSC, etc.) | Free |

### Open Source Building Blocks

**1. Frontend — brandmylaptop fork** (dpratyush02/brandmylaptop)
- Interactive laptop mockup with numbered sticker zones + live logo rendering
- 72-hour auction system (we'll convert to ongoing pay-to-rank)
- Admin dashboard for managing spots + fulfillment tracking
- Dodo Payments integration (we'll replace with crypto-payment-gateway)
- Next.js + TypeScript + Prisma + Tailwind
- Vercel-ready deployment

**2. Payment — crypto-payment-gateway** (3aLaee/crypto-payment-gateway)
- Next.js API routes for initiating + verifying crypto payments
- On-chain verification: polls blockchain, detects Transfer events for ERC20
- Supabase integration for order tracking
- Multi-currency: BTC, ETH, USDT/ERC20 (we'll add USDC, DAI, BNB)
- Address rotation to avoid payment collisions
- Zero UI — pure backend, drops into any Next.js app

### What We Customize

1. **Replace laptop mockup**: HP laptop → MacBook
2. **Replace payment**: Dodo Payments → crypto-payment-gateway
3. **Replace auction model**: 72-hour auction → ongoing pay-to-rank (outbid anytime)
4. **Add tokens**: USDC, DAI, BNB alongside existing ETH/USDT
5. **Add chains**: BSC, Base, Polygon RPC endpoints
6. **Rebrand**: PulseChain community theme, dark mode, degen copy
7. **Add photo gallery**: Real MacBook sticker photos section

### Website (v1 — MVP)

- **One page**: Hero (MacBook mockup) + Leaderboard + How to Bid + Payment Flow
- **Leaderboard**: Project name, logo, amount paid, rank, link
- **Photo gallery**: Real photos of the MacBook with current stickers
- **Admin panel**: Manage spots, verify payments, update fulfillment status
- **Mobile responsive**: PulseChain community browses on mobile (Telegram links)

### Design Vibe
- Dark theme (crypto native)
- Clean, minimal — let the MacBook photo and leaderboard speak
- Playful copy, degen energy, PulseChain community tone
- NOT corporate — this is fun
- Design reference: TBD — user will provide

### Operations (Automated for v1)
- Payment detection is automatic (crypto-payment-gateway polls blockchain)
- Leaderboard updates automatically when payment confirmed in Supabase
- Manual only: print sticker, apply to MacBook, take photo, post on Twitter

### Domain
- TBD — deciding between options like sacrificemymac.lol, pulseboard.lol, etc.
- Also claim a .pls domain for the payment wallet address

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Not enough projects care | Low revenue, dead board | Seed with 3-5 projects before launch, keep floor prices very low |
| PulseChain community too small | Revenue ceiling hit quickly | This is a side project, not a full business. $500+ is a win |
| Community backlash ("cash grab") | Negative perception | Frame as fun/community, keep it light and transparent |
| PLS price crashes | Revenue worth less in USD | Accept DAI (stablecoin) as alternative |
| Sticker logistics annoying | Operational friction | Only top 10 get physical stickers, rest are digital-only |
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

## 11. Timeline

| Week | Milestone |
|------|-----------|
| Week 1 | Finalize name, buy domain, design site |
| Week 2 | Build MVP site, set up wallet |
| Week 3 | Seed outreach — DM 10 projects, get 3-5 on board |
| Week 4 | Public launch — Twitter, Telegram, Reddit |
| Week 5+ | Growth loop — outbid wars, weekly updates, meetup appearances |

---

## 12. Summary

A pay-to-rank MacBook sticker leaderboard built exclusively for the PulseChain community. Projects pay in PLS or DAI to rank higher. Top projects get a real sticker on a real MacBook with photo proof. The competitive outbid dynamic creates ongoing engagement and revenue. Launch strategy targets PulseChain's concentrated community channels (Telegram 40K, Twitter, Reddit). Realistic revenue: $500-3,000. Low build cost, zero maintenance overhead, pure profit from day one.
