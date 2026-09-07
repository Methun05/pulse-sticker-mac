# PulseSticker — Pre-launch Checklist

> All items must be done before going live with real payments.

---

## Legal / compliance
- [ ] Privacy policy page (required if collecting any user data — wallet addresses, brand info, IPs)
- [ ] Terms and conditions page
- [ ] Cookie consent banner

## Security (OWASP basics)
- [x] SQL injection — Prisma parameterizes all queries, no raw SQL found
- [x] XSS — server-side validation: logoUrl must be https://, website must be http(s)://, rejects javascript: protocol
- [x] Broken auth — removed hardcoded password fallback, Bearer-only auth, timing-safe comparison
- [ ] CSRF protection on payment/admin endpoints
- [ ] Force HTTPS (Vercel handles this by default — verify)
- [x] Rate limiting on all API routes (in-memory, IP-based): payment/initiate 10/min, payment/status 20/min, admin 30/min, analytics 30/min, track-click 30/min
- [ ] Spam protection (honeypot / captcha on bid form)

## Secrets
- [x] .env / .env.local is in .gitignore (verified — never committed)
- [x] No secrets in frontend code (audited — zero process.env in components/)
- [x] No sensitive data in API responses (all catch blocks return generic "Internal server error")
- [x] Remove secrets from console.log — errors logged server-side only, no raw error.message sent to clients
- [x] Verify DEPOSIT_ADDRESSES, ADMIN_PASSWORD, DATABASE_URL are only in Vercel env vars
- [x] Admin password fallback removed — if env var missing, returns 503 instead of using hardcoded password
- [x] Admin auth: Bearer header only (removed query param ?key= which leaked password in logs/URLs)
- [x] Destructive clean-reset changed from GET to POST (prevents accidental trigger by crawlers/prefetch)

## SEO / social
- [ ] Meta title + description on all pages
- [ ] Social preview image (og:image for Twitter/Discord/Telegram link previews)
- [ ] Favicon (proper .ico + apple-touch-icon)
- [ ] Sitemap.xml + robots.txt
- [ ] Alt text on all images (MacBook photos, logos)

## Performance
- [ ] Compress images (macbook-inside.webp, macbook-lid.webp, macbook-outside.webp)
- [ ] Check page load speed (Lighthouse / PageSpeed Insights)

## Accessibility / UX
- [ ] Fix color contrast (WCAG AA on all text)
- [ ] Mobile-friendly (test all breakpoints, especially BidModal + MacBook mockup)
- [ ] Custom 404 error page
- [ ] Fix any broken links (nav anchors, footer links)

## Forms / data
- [ ] Form validation on BidModal (required fields, URL format, wallet address format, min bid)
- [ ] Analytics setup (Vercel Analytics or Google Analytics)
