# PulseSticker Design System

> Single source of truth for all frontend decisions. Read this before touching any component.

---

## Typography

- **Font**: System Apple font (-apple-system, BlinkMacSystemFont, SF Pro)
- **Fallback**: system-ui, sans-serif
- **Primary headline (total raised number)**: 80px mobile / 100px desktop, bold, tabular-nums
- **H1 (hero headline)**: clamp(1.75rem, 5vw, 3rem), medium (500), tracking -0.04em
- **H2 (hero subtext)**: 15px mobile / 17px desktop, regular (400), color ink-2
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
--ink:           #1d1d1f   (primary text, focus borders, primary CTA bg)
--ink-2:         #56565c   (secondary text)
--ink-3:         #86868b   (muted text, placeholders, icons)
--hairline:      #d2d2d7   (borders, dividers, default input borders)
--blue:          #0071e3   (primary CTA — used in BidModal only)
--blue-hover:    #0077ed   (primary CTA hover)
--green:         #1a7f37   (success states)
--amber:         #d97706   (warning states)
--red:           #e40014   (error states)
--pulse-green:   #00ff55   (PulseChain brand)
--pulse-green-2: #00ff99   (PulseChain brand secondary)
```

---

## Buttons

### Hero Primary CTA: "Claim a spot"

Minimal solid button. No gradients, no foil effects.

- **Style**: Solid dark background, white text
- **Background**: `var(--ink)` (#1d1d1f)
- **Shape**: `rounded-[20px]`
- **Height**: `h-14` (56px)
- **Padding**: `px-8` (32px horizontal)
- **Font**: `text-lg` (18px), `font-semibold` (600)
- **Hover**: `scale-105` (scale up 5%)
- **Active**: `scale-90` (press down)
- **Transition**: `all 0.3s`
- **Where it appears**: Hero section only

### Hero Secondary CTA: "Support the mission"

- **Style**: Text link with animated underline + arrow
- **Font**: 14px, medium (500), color `var(--ink-3)`
- **Hover**: color shifts to `var(--ink-2)`, underline draws left-to-right (500ms spring ease), arrow nudges right
- **Layout**: Side by side with primary CTA, `gap-6`

### Navbar buttons

- **"Learn more"**: outlined, `rounded-[14px]`, `h-10`, `border border-[var(--hairline)]`, hidden on mobile
- **"Claim your spot"**: solid, `rounded-[14px]`, `h-10`, `bg-[var(--ink)]`, white text
- **Both**: `font-semibold text-base`, `hover:scale-[1.04] active:scale-[0.92]`

### Secondary actions (SpotCard buttons, etc.)

- Outline style, rounded-full
- Smaller: px-4 py-1.5, 13px font
- No effects — keep it simple

### What we do NOT have

- No "Connect wallet" button (manual send flow)
- No "Share" button
- No login/signup
- **No foil/gradient buttons in hero** (removed — kept minimal)

---

## Layout & Sections

### Navbar

- **Position**: `sticky top-0 z-50`
- **Background**: `bg-white/80 backdrop-blur-xl`
- **Container**: `max-w-[80rem]` (1280px), `px-4 sm:px-6 lg:px-8`
- **Height**: `h-14` (56px)
- **Logo**: `text-xl font-semibold`, text only ("PulseSticker"), no icon mark
- **Center links**: `absolute left-1/2 -translate-x-1/2`, hidden on mobile (`md:flex`)
- **Link style**: `font-semibold text-base text-[var(--ink-2)]`, `hover:scale-[1.03]`
- **Right buttons**: `gap-1.5`, "Learn more" (outline) + "Claim your spot" (solid)
- **Hamburger**: `h-10 w-10 rounded-full border`, visible only on mobile

### Hero Section

- **Background**: White (same as body)
- **Padding**: `pt-16 pb-12` (64px / 48px — harmonic 1.33 ratio)
- **Container**: `max-w-2xl` (672px)
- **Total Raised Number**: 80px mobile / 100px desktop, bold
  - Uses `torph` TextMorph for smooth digit-by-digit morphing
  - Counts from value-20 (e.g. $180→$200) for smoother animation
  - Duration: 1.5s, ease-out quad
  - Dollar sign rendered static (outside morph)
- **Progress bar**: below number, `max-w-sm`, 4px height
  - Gradient fill: `from-[#00BFFF] via-[#8B5CF6] to-[#EC4899]`
  - CSS entrance animation: `animate-progress-fill` (0%→target, 1.8s spring)
  - Labels: "$200 raised" (ink-2) / "goal $500" (ink-3)
- **H1**: "Taking PulseChain to the World" — medium weight, clamp sizing
- **H2**: concise mission statement — regular weight, ink-2 color, `max-w-[50ch]`
- **CTAs**: side by side (`gap-6`)
  - Primary: solid dark button (see Buttons above)
  - Secondary: "Support the mission" text link with animated underline

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

- Uses `<Accordion>` design system component
- Section heading + max-w-2xl container

### Footer

- Minimal. Logo, nav links, disclaimer.

---

## Animation

### torph (installed)

- **CountUp**: Total raised number morphs digit-by-digit
  - Uses `TextMorph` from `torph/react`
  - Starts from value-20 for smooth final digits
  - Duration: 1.5s, ease-out quad
  - Dollar sign static, only digits morph

### CSS Animations (globals.css)

- **Progress bar fill**: `animate-progress-fill` — 0%→target width, 1.8s cubic-bezier(0.16, 1, 0.3, 1)
- Spot pulse: hover glow on available spots
- FAQ accordion: grid-template-rows transition (0.3s)
- Modal entry: `animate-modal-in` — 0.25s cubic-bezier(0.16, 1, 0.3, 1) scale+fade

### CSS Utility Classes (globals.css)

- `.shadow-dialog` — `0px 8px 36px rgba(55, 65, 81, 0.15)` (megapot dialog shadow)
- `.thin-scrollbar` — 4px scrollbar for modal content
- `.animate-modal-in` — modal entry animation
- `.animate-progress-fill` — progress bar entrance

### No over-animation

- No scroll-triggered reveals on every section
- No parallax
- Keep it fast and purposeful

---

## Spacing

- **Navbar container**: max-w-[80rem] (1280px), `px-4 sm:px-6 lg:px-8`
- **Navbar height**: h-14 (56px)
- **Hero padding**: pt-16 pb-12 (64px / 48px)
- **Hero content**: max-w-2xl (672px)
- **CTA gap**: gap-6 (24px) between primary and secondary
- Max content width: 6xl (1152px) for full-width sections
- Section padding: varies per section
- Component gaps: 4px card grid gap
- Page horizontal padding: px-4 sm:px-6

---

## Dependencies

| Package | Purpose | Status |
|---------|---------|--------|
| Space Grotesk | Font (layout.tsx) | Installed (next/font/google) |
| torph | CountUp digit morphing | Installed (npm) |
| clsx | Class merging | Installed |
| tailwind-merge | Tailwind class dedup | Installed |
| lucide-react | Icons | Installed |
| motion | Stepper digit animations (motion/react) | Installed |
| react-icons | Stepper +/- icons (HiMinus, HiPlus) | Installed |

---

## File Structure (frontend)

```
app/
  globals.css          -- CSS variables, base styles, animations
  layout.tsx           -- Font loading, metadata, body wrapper
  page.tsx             -- Page composition (all sections)

components/
  layout/
    Navbar.tsx         -- Megapot-style spacing (h-14, max-w-[80rem])
    Footer.tsx
  sections/
    HeroSection.tsx    -- White bg, big number, solid CTA
    HowItWorksSection.tsx
    FAQSection.tsx
  laptop/
    MacBookMockup.tsx  -- Lid + Inside views
  spots/
    SpotCard.tsx
    SpotCardGrid.tsx
    BidModal.tsx
  ui/
    Accordion.tsx      -- Rounded card accordion (FAQ)
    BlockieAvatar.tsx  -- Deterministic pixelated avatar
    FloatingInput.tsx  -- Floating label text input
    FoilButton.tsx     -- Foil depth button (kept for BidModal, NOT hero)
    LogoUpload.tsx     -- Drag & drop logo upload
    Stepper.tsx        -- Animated number stepper
    CountUp.tsx        -- torph TextMorph number animation

lib/
  cn.ts                -- clsx + tailwind-merge utility
```

---

## Reference

- `WEB_DESIGN_GUIDELINES.md` — Vercel Labs web interface guidelines (accessibility, forms, animation, typography, performance best practices)

---

## Rules

1. One hero CTA only: "Claim a spot" — solid dark button, no gradient
2. Numbers scream — 80-100px bold, torph-animated
3. White body throughout — no dark sections
4. No over-engineering. Simple components, no premature abstractions.
5. Use CSS variable tokens (`var(--ink)`, `var(--surface)`, etc.) — NEVER hardcoded hex in components.
6. Navbar: h-14, max-w-[80rem], no extra padding. Megapot spacing pattern.
7. Test every change visually before pushing.
