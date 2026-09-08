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

Defined in `app/globals.css` `:root`. All components MUST use these tokens — no hardcoded hex.

```
--background:    #ffffff
--surface:       #f5f5f7   (light gray backgrounds, button fills)
--ink:           #1d1d1f   (primary text, focus borders)
--ink-2:         #56565c   (secondary text)
--ink-3:         #86868b   (muted text, placeholders, icons)
--hairline:      #d2d2d7   (borders, dividers, default input borders)
--blue:          #0071e3   (primary CTA)
--blue-hover:    #0077ed   (primary CTA hover)
--green:         #1a7f37   (success states)
--amber:         #d97706   (warning states)
--red:           #e40014   (error states)
--pulse-green:   #00ff55   (PulseChain brand)
--pulse-green-2: #00ff99   (PulseChain brand secondary)
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

### CSS Animations (globals.css)
- Foil button: ambient rainbow drift (7s), cursor-reactive shine/glare
- Spot pulse: hover glow on available spots
- FAQ accordion: grid-template-rows transition (0.3s)
- Modal entry: `animate-modal-in` — 0.25s cubic-bezier(0.16, 1, 0.3, 1) scale+fade

### CSS Utility Classes (globals.css)
- `.shadow-dialog` — `0px 8px 36px rgba(55, 65, 81, 0.15)` (megapot dialog shadow)
- `.thin-scrollbar` — 4px scrollbar for modal content
- `.animate-modal-in` — modal entry animation

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
| Space Grotesk | Font | Installed (next/font/google) |
| GSAP | CountUp animation | To install (npm) |
| clsx | Class merging | Installed |
| tailwind-merge | Tailwind class dedup | Installed |
| lucide-react | Icons | Installed |
| motion | Stepper digit animations (motion/react) | Installed |
| react-icons | Stepper +/- icons (HiMinus, HiPlus) | Installed |

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
    FloatingInput.tsx  -- Floating label text input (var tokens)
    FoilButton.tsx     -- Reusable foil depth button component
    LogoUpload.tsx     -- Drag & drop logo upload, dual-mode (var tokens)
    Stepper.tsx        -- Animated number stepper (motion + react-icons)
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

### FloatingInput (`components/ui/FloatingInput.tsx`)

Text input with a floating label that animates up when focused or filled.

**Visual spec:**
- `rounded-xl`, `border border-[var(--hairline)]`, focus: `border-[var(--ink)]`
- Input: `px-4 py-4`, `text-sm text-[var(--ink)]`, `bg-transparent`
- Label resting: `left-4 top-4 text-sm text-[var(--ink-3)]`
- Label active (focus/filled): `-top-2.5 left-3 text-xs bg-white px-1 text-[var(--ink)]`
- Label transition: `all 0.2s` via Tailwind peer utilities

**Props:** Extends `React.InputHTMLAttributes<HTMLInputElement>` plus:
- `label`: `string` — floating label text

**Usage:**
```tsx
import { FloatingInput } from '@/components/ui/FloatingInput';

<FloatingInput label="Brand name *" value={name} onChange={e => setName(e.target.value)} required />
<FloatingInput label="Website" type="url" value={url} onChange={e => setUrl(e.target.value)} />
```

### LogoUpload (`components/ui/LogoUpload.tsx`)

Drag & drop file upload zone that uploads to `/api/upload` (Vercel Blob). Dual-mode component.

**Visual spec:**
- `rounded-xl`, `border border-dashed border-[var(--hairline)]`, `hover:border-[var(--ink)]`
- Drag over: `border-[var(--ink)] bg-[var(--surface)]`
- Upload icon: `stroke="var(--ink-3)"`, text: `text-[var(--ink-3)]`
- Preview (value mode): 40px thumbnail + "Click to replace" text
- Error: `text-[var(--red)]`
- Accepts: PNG, JPG, WEBP, max 500KB

**Two usage modes:**

1. **Value mode** (Step 1 form — pre-payment):
   - Props: `value: string | null`, `onChange: (url: string | null) => void`
   - Uploads without bidId, returns URL via onChange, shows preview

2. **Submit mode** (Step 3 — post-payment):
   - Props: `bidId: string`, `uploadToken: string`, `onSubmitted: () => void`
   - Uploads with bidId/uploadToken, calls onSubmitted on success

**Usage:**
```tsx
import { LogoUpload } from '@/components/ui/LogoUpload';

// Value mode (form)
<LogoUpload value={logoUrl} onChange={setLogoUrl} />

// Submit mode (post-payment)
<LogoUpload bidId={id} uploadToken={token} onSubmitted={() => setStep('done')} />
```

### Stepper (`components/ui/Stepper.tsx`)

Animated number stepper with spring-physics digit transitions. Used for bid amount selection.

**Visual spec:**
- Layout: `flex items-center justify-center gap-4`
- Buttons: `h-8 w-8 rounded-full bg-[var(--surface)] text-[var(--ink-2)]`, icons `h-3.5 w-3.5`
- Button hover: scale 1.05 (motion spring), tap: scale 0.92
- Digits: `text-[48px] font-bold tracking-[-0.03em] text-[var(--ink)]`, digit containers `w-7`, `gap-0`
- Dollar sign prefix baked into digit array
- Each digit animates independently (spring: stiffness 200, damping 16, mass 1.2)
- No disabled styling on buttons (always look enabled)

**Dependencies:** `motion` (motion/react), `react-icons` (HiMinus, HiPlus)

**Props:**
- `value?`: `number` — controlled value
- `defaultValue?`: `number` (default `0`)
- `min?`: `number` (default `0`)
- `max?`: `number` (default `999`)
- `onChange?`: `(val: number) => void`

**Usage:**
```tsx
import { Stepper } from '@/components/ui/Stepper';

<Stepper value={bidAmount} min={5} max={10000} onChange={setBidAmount} />
```

### BidModal (`components/spots/BidModal.tsx`)

Multi-step modal for placing bids on MacBook spots. Megapot-inspired dialog styling.

**Visual spec (shell):**
- `rounded-[36px]`, `shadow-dialog` (0px 8px 36px rgba(55,65,81,0.15))
- `border border-[var(--hairline)]`, `bg-white`
- `max-h-[95dvh]`, `sm:max-w-lg`
- Entry: `animate-modal-in` (0.25s cubic-bezier scale+fade)
- Header: title left-center + close button absolute-right (same row)
- Close button: `h-9 w-9 rounded-full bg-[var(--surface)]` with filled X icon

**Step 1 — Form:**
- Title "Place your bid" (20px bold) in header row, centered
- Stepper directly below header (48px digits, tight spacing)
- No subtitle text
- `mb-6` gap separates stepper section from form fields
- Fields (each `space-y-4`): Brand name* → Website → Email → X handle → LogoUpload
- Two side-by-side payment buttons (`flex gap-3`):
  - "Pay with Crypto": `rounded-full bg-[var(--blue)]` (primary)
  - "Pay with Fiat": `rounded-full border border-[var(--hairline)]` (secondary/outlined)
- Each button submits the form and routes directly to its payment step (no method selection screen)
- Terms text below buttons: `text-[12px] text-[var(--ink-3)]`

**Step 2a — Crypto:** Token/chain/wallet form → payment instructions → poll → logo upload → done
**Step 2b — Card:** Coming soon screen (placeholder)
**Back buttons** in crypto/card return to form step

**State:** brandName, website, xHandle, email, logoUrl, bidAmount (number), step, paymentData

---

## Rules

1. One CTA only: "Claim a spot"
2. Numbers scream — 60px bold, animated
3. Foil button is hero-only. Don't put it everywhere.
4. White body, dark hero section only
5. No over-engineering. Simple components, no premature abstractions.
6. Use CSS variable tokens (`var(--ink)`, `var(--surface)`, etc.) — NEVER hardcoded hex in components.
7. Test every change visually before pushing.
