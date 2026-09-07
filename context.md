# PulseSticker — Project Context

> Read this file at the start of every session. It contains the full project state, architecture, key decisions, and lessons learned.

---

## What this project is

Pay-to-rank MacBook sticker leaderboard for the PulseChain community. Projects pay crypto to claim spots on a leaderboard. Top-ranked projects get their logo physically stickered on Methun's MacBook lid.

- 10 spots on MacBook lid (different sizes/positions, starting prices $1–$5)
- Payment: on-chain verification via ethers.js (no third-party provider, $0 cost)
- Phase 1: stablecoins only (USDC, USDT, DAI). ETH/BNB blocked (no price feed yet)
- 5 chains: Ethereum, BSC, PulseChain, Base, Polygon
- Ongoing leaderboard (not timed auction) — anyone can outbid anytime
- NOT a marketplace — single laptop, single owner, no listing features

---

## Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, React 19
- **Backend**: Next.js API routes, Prisma 5, ethers.js v6
- **Database**: Neon PostgreSQL (project: ancient-bird-50114279, org: org-sparkling-paper-12487049)
- **Hosting**: Vercel (free tier), auto-deploy from GitHub main branch
- **Repo**: github.com/Methun05/pulse-sticker-mac — local path: ~/pulse-sticker-mac
- **Production**: https://pulse-sticker-mac.vercel.app

---

## Current state (as of Sep 7 2026 — session 2)

### Done
- ✅ Backend complete: Prisma schema, all API routes, crypto verification
- ✅ Deployed to Vercel (production), Neon DB connected, schema pushed
- ✅ Board API live and returning 10 spots
- ✅ Payment initiate/status endpoints working, tested end-to-end
- ✅ Admin routes (pause/resume/reset/update prices)
- ✅ Security fixes: payment cross-match vulnerability (unique cents + tx hash dedup + tight matching band)
- ✅ Code review fixes: race condition ($transaction), ETH/BNB blocked, min bid $1 increment
- ✅ Frontend rebuilt: Apple-inspired light theme (brandmylaptop.com style)
- ✅ MacBook mockup: Lid view (CSS gradient + 6×3 spot grid) + Inside view (real photo + spots)
- ✅ Lid/Inside pill toggle (exact brandmylaptop pattern)
- ✅ Empty spots: "+" icon + price, subtle bg rgba(0,0,0,0.02), dashed border
- ✅ BidModal: form → deposit address + amount → poll for on-chain confirmation → done/expired
- ✅ All sections: Navbar, Hero, MacBook mockup, SpotCardGrid, HowItWorks, FAQ, Footer

### TODO (features)
- Admin page (app/admin/page.tsx) still uses old API actions — needs rewire
- DEPOSIT_ADDRESSES env var is placeholder zeros — must replace with real wallets before accepting payments
- Old unused components from fork still exist — can be deleted:
  - components/auction/
  - components/laptop/HPLaptopMockup.tsx
  - components/sections/LiveAuctionSection.tsx
  - components/sections/LiveSalesSection.tsx
  - components/social/
  - components/currency/
- Add ETH/BNB support with price feed (Phase 2)

### Pre-launch checklist
See [checklist.md](./checklist.md)

---

## Key files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Board, Spot, Bid, Payment, AdminConfig models |
| `lib/crypto.ts` | Chain configs, token configs, on-chain verification, unique amount matching |
| `lib/db.ts` | Prisma singleton + ensureDatabase bootstrap |
| `app/api/board/route.ts` | GET board state + leaderboard |
| `app/api/payment/initiate/route.ts` | POST create payment (unique cents per address) |
| `app/api/payment/status/route.ts` | GET poll for on-chain confirmation (tx hash dedup) |
| `app/api/admin/route.ts` | Admin CRUD |
| `app/page.tsx` | Main page (loads /api/board, renders all sections, polls every 5s) |
| `components/laptop/MacBookMockup.tsx` | Lid + Inside views, ViewToggle, SpotCell, AppleLogo |
| `components/spots/BidModal.tsx` | Full crypto bid flow (form → pay → poll → done) |
| `components/spots/SpotCard.tsx` | Individual spot card |
| `components/spots/SpotCardGrid.tsx` | Grid of spot cards |
| `components/sections/HeroSection.tsx` | Hero with headline, CTAs, social proof |
| `components/sections/HowItWorksSection.tsx` | 3-step explainer |
| `components/sections/FAQSection.tsx` | 7 FAQs with accordion |
| `components/layout/Navbar.tsx` | Sticky navbar with blur, logo, nav links, CTA |
| `components/layout/Footer.tsx` | Minimal footer with disclaimer |
| `public/macbook-inside.webp` | MacBook top-down photo (1553×1013px) for inside view |

---

## MacBook mockup architecture

### LidView
- CSS gradient aluminum surface with `aspect-ratio: 1.44`
- Specular highlight overlay (radial-gradient)
- Apple logo SVG (exact path from brandmylaptop source)
- 6-col × 3-row CSS grid for 10 spots
- Uses `--lidw` CSS var via ResizeObserver for responsive sizing
- Lid finish: `linear-gradient(172deg, #ececed 0%, #dcdcdf 45%, #c8c8cd 100%)`

### Lid spot layout (LID_SPOTS)
```
Row 1: [1: L, 2col] [2: L, 2col] [3: L, 2col]
Row 2: [4: S, 1col] [5: S, 1col]  ...  [6: S, 1col] [7: S, 1col]
Row 3: [8: M, 2col] [9: M, 2col] [10: M, 2col]
```

### InsideView
- Real MacBook photo (`macbook-inside.webp`, 1553×1013px) as background
- Two separate 2×2 grids absolutely positioned on the palm rest
- Left zone: `left: 10%, width: 21%` (spots 1–4)
- Right zone: `right: 10%, width: 21%` (spots 5–8)
- Vertical: `top: 64%, bottom: 8%`
- Uses `--basew` CSS var via ResizeObserver

### Photo measurements (1553×1013px)
- Speaker grille inner edges: 9.7% / 90.3% horizontal
- Trackpad: 32%–68% horizontal, 64%–91% vertical
- Laptop body edges: ~4.5% / ~95.5%
- Usable palm rest: 10%–31% left, 69%–90% right

### SpotCell (shared component)
- **Empty**: "+" SVG icon + `$price`, bg `rgba(0,0,0,0.02)`, dashed border `rgba(0,0,0,0.1)`, hover darkens
- **Occupied**: logo image (or brand name text) + `$currentBid` in green
- Uses `cssVar` prop (`--lidw` or `--basew`) for responsive font sizing via `calc(var(--lidw) * 0.016)`

### ViewToggle
- Pill-style Lid/Inside switcher
- Background: `rgba(0,0,0,0.06)`, active tab: white with shadow + ring

---

## Design system

- **Theme**: Light — white bg #fff, surface #f5f5f7, ink #1d1d1f, blue CTA #0071e3
- **Font**: Inter, tight tracking on headlines (-0.04em)
- **Buttons**: rounded-full, blue primary, bordered secondary
- **Style**: Apple-inspired, clean, minimal — reverse-engineered from brandmylaptop.com
- **CSS vars**: --ink, --ink-2, --ink-3, --surface, --hairline, --blue (defined in globals.css)
- **NOTE**: dpratyush02/brandmylaptop GitHub is NOT the real owner — ignore that repo

---

## Payment system

### Flow
1. User picks spot, enters brand/logo/wallet, selects token + chain
2. `POST /api/payment/initiate` → returns deposit address + unique token amount + 30min expiry
3. User sends exact amount to deposit address
4. Frontend polls `GET /api/payment/status` every 5 seconds
5. Backend calls `verifyERC20Payment()` via `eth_getLogs` — checks for matching transfer
6. On match: payment CONFIRMED, bid updated, spot claimed (inside `$transaction`)

### Security (3 layers)
1. **Unique amounts**: random cents offset (0.01–0.99) per payment — avoids two bidders sending same amount to same address
2. **Tight matching**: ±0.5% band (not `>= threshold`) for ERC20 verification
3. **Tx hash dedup**: confirmed tx hashes excluded from future verifications — prevents replay

### Blocked
- ETH and BNB native tokens are blocked in Phase 1 (no price feed — $100 bid would be interpreted as 100 ETH)
- Min bid increment: $1 flat above current bid

### Deposit addresses
- 2 addresses per chain, load-balanced by pending payment count
- Currently placeholder zeros — MUST replace before accepting real payments
- Set via `DEPOSIT_ADDRESSES` env var on Vercel

---

## Env vars (Vercel production)

| Var | Value |
|-----|-------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ADMIN_PASSWORD` | `admin_pulse_sticker_2026` |
| `DEPOSIT_ADDRESSES` | Placeholder zeros — needs real wallets |

---

## Lessons learned / mistakes to avoid

### Inside view photo overlay positioning
Spots must be **pixel-measured from the actual photo**. The MacBook photo (1553×1013px) has speaker grilles at ~9.7%/90.3% and trackpad at 32%–68%. Using rough estimates caused spots to overflow past laptop edges **multiple times**. Always measure from the actual image before setting positions.

### fr units cause overlap with trackpad
Using `1fr 1fr 2fr 1fr 1fr` as a single grid for inside spots caused overlap with the trackpad. **Fixed by splitting into two separate 2×2 grids** (left + right of trackpad) with explicit percentage positioning. For photo overlays where elements must avoid a central area, two separate grids are more reliable than one grid with a placeholder column.

### Iterative sizing on photo overlays
Started at width 25% (overflowed laptop edges), then 21% (still overflowed), then 17% (too small), settled at **21% with left/right at 10% inset**. When positioning overlays on photos, start conservative and widen gradually. The speaker grilles and rounded corners make usable space narrower than expected.

### containerType required for cqw units
`containerType: 'inline-size'` must be set on the wrapper div for `cqw` units to work in `calc()` expressions. Without it, container query units fall back to viewport width.

### ResizeObserver pattern for responsive sizing
brandmylaptop uses CSS variables set via ResizeObserver, not native container queries:
```tsx
const sync = () => el.style.setProperty('--lidw', `${el.getBoundingClientRect().width}px`);
const ro = new ResizeObserver(sync);
```
Then: `fontSize: 'calc(var(--lidw) * 0.016)'`

### TypeScript / build errors
- **BigInt literals** (`100n`): requires `tsconfig.json` target ES2020+. ES2017 does not support them.
- **Always run `npx next build`** before pushing to catch compile errors.
- Old files referencing deleted code (e.g., `app/api/bids/[bidId]/route.ts` referencing Dodo types) must be deleted, not fixed.

### Frontend API endpoint mismatch
After rebuilding the backend, the frontend was still calling `/api/auction` (deleted endpoint). Next.js returned HTML 404 → `response.json()` failed with "Unexpected token '<'". Always check that frontend fetch URLs match actual API routes.

### Payment cross-match vulnerability
Two concurrent bidders sending to the same deposit address could cross-match (bidder A's payment credited to bidder B). Fixed with 3 layers: unique cents offset per payment, tight ±0.5% matching band, tx hash deduplication.

### ETH/BNB as payment token
Without a price feed, `payment/initiate` treated USD amount as token amount ($100 bid = 100 ETH sent). Fixed by blocking native tokens entirely in Phase 1.

---

## Built from
- **Design reference**: brandmylaptop.com (reverse-engineered, not forked)
- **Payment reference**: 3aLaee/crypto-payment-gateway (ethers.js patterns, bugs fixed)
