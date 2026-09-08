# Web Interface Guidelines (Vercel Labs)

> Source: vercel-labs/web-interface-guidelines. Reference this for all UI code reviews.

---

## Accessibility

- Icon buttons require `aria-label`
- Form controls need `<label>` or `aria-label`
- Interactive elements must support keyboard handlers
- Prefer semantic HTML over divs with click handlers
- Images need `alt` tags
- Async updates need `aria-live="polite"`
- Headings hierarchical with skip links
- Media needs captions/transcripts

## Focus States

- Visible focus required via `focus-visible:ring-*`
- Never use `outline-none` without replacement
- Use `:focus-visible` over `:focus`
- Sticky overlays must not cover focused elements

## Forms

- Inputs need `autocomplete` and `name`
- Use semantic `type` attributes
- Never block paste
- Labels clickable via `htmlFor`
- Disable spellcheck on sensitive fields
- Checkboxes/radios need unified hit targets
- Submit buttons stay enabled until request starts
- Errors inline with first-error focus
- Placeholders end with `…` showing patterns
- Warn before navigation with unsaved changes

## Animation

- Honor `prefers-reduced-motion`
- Animate only `transform` / `opacity`
- Never use `transition: all`
- Set correct `transform-origin`
- Make animations interruptible
- Autoplay content >5s needs controls
- Decorative loops stop under reduced-motion preference

## Typography

- Use ellipsis `…` not `...`
- Curly quotes not straight
- Non-breaking spaces for measurements and brand names
- Loading states end with `…`
- Use `tabular-nums` for number columns
- Apply `text-wrap: balance` on headings

## Content Handling

- Text containers handle long content via `truncate`, `line-clamp-*`, or `break-words`
- Flex children need `min-w-0`
- Handle empty states
- Anticipate varied user input lengths

## Images

- Explicit `width` and `height` prevent CLS
- Below-fold uses `loading="lazy"`
- Critical images use `priority` or `fetchpriority="high"`

## Performance

- Virtualize lists >50 items
- Avoid layout reads during render
- Batch DOM operations
- Prefer uncontrolled inputs
- Preconnect CDN domains
- Preload critical fonts with `font-display: swap`
- Prefer compressed video over GIF with still fallback

## Navigation & State

- URL reflects state (filters, tabs, pagination)
- Use `<a>` / `<Link>` for proper middle-click support
- Sync stateful UI to URL
- Destructive actions need confirmation or undo window

## Touch & Interaction

- Apply `touch-action: manipulation`
- Set `-webkit-tap-highlight-color`
- Use `overscroll-behavior: contain` in modals
- Disable text selection during drag
- Provide tap/click and keyboard alternatives for gestures
- Limit `autoFocus`

## Safe Areas & Layout

- Use `env(safe-area-inset-*)` for notches
- Prevent unwanted scrollbars
- Prefer flex/grid over JS measurement

## Dark Mode & Theming

- Set `color-scheme` on `<html>`
- Match `<meta name="theme-color">` to background
- Explicit colors on native `<select>`

## Locale & i18n

- Use `Intl.DateTimeFormat` and `Intl.NumberFormat`
- Detect language via headers/navigator, not IP
- Wrap identifiers with `translate="no"`

## Hydration Safety

- Controlled inputs need `onChange`
- Guard date/time rendering
- Use `suppressHydrationWarning` sparingly

## Hover & Interactive States

- Buttons/links need `hover:` states
- Interactive states increase contrast

## Content & Copy

- Active voice
- Title Case headings
- Numerals for counts
- Specific button labels
- Error messages include next steps
- Second person
- Use `&` where space-constrained

## Anti-patterns to Flag

1. Zoom disabling (`maximum-scale=1`)
2. `preventDefault` on paste
3. `transition: all`
4. `outline-none` without replacement
5. Inline navigation divs (use `<a>` / `<Link>`)
6. Unlabeled inputs
7. Missing `aria-label` on icon buttons
8. Hardcoded date/number formats
9. Unjustified `autoFocus`
10. GIFs instead of compressed video
11. Gesture-only actions (no keyboard alternative)
12. Non-semantic interactive elements
