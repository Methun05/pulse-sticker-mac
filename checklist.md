# PulseSticker — Pre-launch Checklist

> All items must be done before going live with real payments.

---

## Legal / compliance
- [ ] Privacy policy page
- [ ] Terms and conditions page
- [ ] Cookie consent banner

## Security
- [ ] Secrets out of frontend (audit for any exposed keys/tokens in client code)
- [ ] Force HTTPS (Vercel handles this by default — verify)
- [ ] Spam protection (rate limiting / honeypot on bid form)

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
