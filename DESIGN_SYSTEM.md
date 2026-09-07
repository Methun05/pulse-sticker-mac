# PulseSticker Design System

> Single source of truth for all frontend decisions. Read this before touching any component.

---

## Typography

- **Font**: Space Grotesk (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Primary headline (total raised number)**: 60px, bold, tabular-nums
- **Section headings**: clamp(1.25rem, 3vw, 1.75rem), bold, tracking tight
- **Body text**: 15px (mobile), 17px (desktop)
- **Small/labels**: 12-13px
- **Letter spacing**: -0.04em on headlines, -0.03em on section heads

---

## Color Palette

> Colors TBD — will be decided in a separate session. Placeholder tokens below.

```
--background:    TBD (white base)
--surface:       TBD (light gray sections)
--ink:           TBD (primary text)
--ink-2:         TBD (secondary text)
--ink-3:         TBD (muted text)
--hairline:      TBD (borders/dividers)
--primary:       TBD (main CTA color)
--primary-hover: TBD
--green:         TBD (success states)
--amber:         TBD (warning states)
--red:           TBD (error states)
--pulse-green:   #00ff55 (PulseChain brand)
--pulse-green-2: #00ff99 (PulseChain brand secondary)
```

---

## Buttons

### Single CTA: "Claim a spot"

This is the ONLY call-to-action on the page. Every other interactive element is secondary.

- **Style**: Foil depth button (iridescent metal effect)
- **Shape**: pill (border-radius: 999px)
- **Height**: 44px
- **Padding**: 0 22px
- **Font**: 500 weight, 15px
- **Effect**: Multi-layer depth system (not a flat button with a drop shadow)
  - Base gradient (body)
  - Inset shadows (bevel + inner glow)
  - ::before hover layer (light turning on)
  - ::after specular highlight (sheen)
  - Foil variant: iridescent rainbow band, pearl sheen, shine band, glare dot
  - Cursor-reactive: --pointer-x/y, --glare-x/y, --foil-shift, --shine-angle
- **Animation**: ambient drift on rainbow band (7s ease-in-out infinite alternate)
- **Where it appears**: Hero section only. Navbar may have a smaller, simpler version.

### Secondary actions (SpotCard buttons, etc.)

- Outline style, rounded-full
- Smaller: px-4 py-1.5, 13px font
- No foil effect — keep it simple

### What we do NOT have

- No "Connect wallet" button (manual send flow)
- No "Share" button
- No login/signup

---

## Layout & Sections

### Hero Section
- **Background**: White (same as body — fully white page)
- **Total Raised Number**: 60px bold, GSAP CountUp animation (0 to value on load)
  - Tabular nums, no shifting
  - Label below: "raised so far" in muted text
  - This is the FIRST thing the user sees
- **Headline**: below the number, ~3rem
- **Subtext**: 1-2 sentences, muted
- **Single CTA**: "Claim a spot" foil button
- **Token badges**: USDC, USDT, DAI pills

### MacBook Mockup
- Lid view (CSS gradient + 6x3 spot grid) / Inside view (photo + 2x2 grids)
- Pill toggle: Lid / Inside
- Clickable spots open BidModal

### Spot Cards
- 3-column grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- White cards with border, hover shadow
- Size badge, position label, current bid, action button

### How It Works
- 3-step grid on surface background
- Number circles, title, description

### FAQ
- Uses `<Accordion>` design system component (see Components below)
- Section heading + max-w-2xl container

### Footer
- Minimal. Logo, nav links, disclaimer.

---

## Animation

### GSAP (to install)
- **CountUp**: Total raised number rolls from 0 to value
  - Trigger: on page load (hero is always visible)
  - Duration: ~2s
  - Ease: power2.out
  - Format: dollar sign prefix, comma separators

### CSS Animations
- Foil button: ambient rainbow drift (7s), cursor-reactive shine/glare
- Spot pulse: hover glow on available spots
- FAQ accordion: grid-template-rows transition (0.3s)

### No over-animation
- No scroll-triggered reveals on every section
- No parallax
- Keep it fast and purposeful

---

## Spacing

- Max content width: 6xl (1152px) for full-width sections
- Max content width: 2xl (672px) for text-heavy sections (hero, FAQ)
- Section padding: py-16 sm:py-20
- Component gaps: 4px card grid gap
- Page horizontal padding: px-4 sm:px-6

---

## Dependencies

| Package | Purpose | Status |
|---------|---------|--------|
| Space Grotesk | Font | To install (next/font/google) |
| GSAP | CountUp animation | To install (npm) |
| clsx | Class merging | Already installed |
| tailwind-merge | Tailwind class dedup | Already installed |
| lucide-react | Icons | Already installed |

---

## File Structure (frontend)

```
app/
  globals.css          -- CSS variables, base styles, foil button CSS
  layout.tsx           -- Font loading, metadata, body wrapper
  page.tsx             -- Page composition (all sections)

components/
  layout/
    Navbar.tsx
    Footer.tsx
  sections/
    HeroSection.tsx    -- Dark bg, big number, CTA
    HowItWorksSection.tsx
    FAQSection.tsx
  laptop/
    MacBookMockup.tsx  -- Lid + Inside views
  spots/
    SpotCard.tsx
    SpotCardGrid.tsx
    BidModal.tsx
  ui/
    Accordion.tsx      -- Rounded card accordion (FAQ, info disclosure)
    BlockieAvatar.tsx   -- Deterministic pixelated avatar (crypto identicon)
    FoilButton.tsx     -- Reusable foil depth button component
    CountUp.tsx        -- GSAP number animation component

lib/
  cn.ts                -- clsx + tailwind-merge utility
```

---

## Components

### Accordion (`components/ui/Accordion.tsx`)

Rounded card accordion with smooth expand/collapse animation.

**Visual spec:**
- Each item: `rounded-[24px]`, `bg-[var(--surface)]` (grey cards on white page)
- Gap between items: `gap-3` mobile, `gap-4` desktop
- Button padding: `px-6 py-5`
- Title: `18px`/`20px` bold, `tracking-[-0.2px]`, `var(--ink)`
- `+` icon: `26px`, rotates 45deg to `×` on open (0.2s ease)
- Answer: `px-6 pb-6`, `16px`/`18px`, `leading-[1.4]`, `var(--ink-2)`, `tracking-[-0.18px]`
- Animation: CSS `grid-template-rows` 0fr → 1fr (300ms ease-in-out)

**Props:**
- `items`: `{ title: string, content: ReactNode }[]`
- `allowMultiple?`: `boolean` (default `false`) — allow multiple items open at once

**When to use:**
- FAQ sections
- Info disclosure lists (title + hidden detail pairs)
- Collapsible option groups in settings/config panels

**When NOT to use:**
- Single toggle (use a simple disclosure)
- Navigation menus
- Tabbed content where all options should be visible

**Usage:**
```tsx
import { Accordion } from '@/components/ui/Accordion';

<Accordion items={[
  { title: 'Question?', content: 'Answer text or JSX.' },
  { title: 'Another?', content: <p>Rich content with <a href="#">links</a>.</p> },
]} />
```

### BlockieAvatar (`components/ui/BlockieAvatar.tsx`)

Deterministic pixelated avatar generated from a seed string. Crypto-native identicon style.

**Visual spec:**
- Canvas-based, 5x5 symmetric grid (mirrored left-to-right)
- 3 colors per avatar: `hsl(h, 65%, 50%)`, `hsl(h+120, 70%, 45%)`, `hsl(h+240, 60%, 55%)`
- Full 360° hue rotation, 60-70% saturation (visible but not overpowering)
- `rounded-full` with `image-rendering: pixelated` for crisp edges
- Default size: 36px

**Props:**
- `seed`: `string` — generates unique pattern (brand name, wallet address, etc.)
- `size?`: `number` (default `36`)

**When to use:**
- Spot table rows — avatar for brands/projects (crypto payments)
- Bid history entries — identify bidders
- Any list needing unique visual identifiers without a real logo

**When NOT to use:**
- Brand has an actual logo URL — show the real logo
- Available/empty spots — use a neutral circle with spot number

**Usage:**
```tsx
import { BlockieAvatar } from '@/components/ui/BlockieAvatar';

<BlockieAvatar seed="PulseX" />
<BlockieAvatar seed="0x1234...abcd" size={48} />
```

---

## Rules

1. One CTA only: "Claim a spot"
2. Numbers scream — 60px bold, animated
3. Foil button is hero-only. Don't put it everywhere.
4. White body, dark hero section only
5. No over-engineering. Simple components, no premature abstractions.
6. Colors will be decided separately — use CSS variable tokens, not hardcoded hex.
7. Test every change visually before pushing.
