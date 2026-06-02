# TODO — before launch

Pre-launch checklist for the Nibras portal. **None of these block local development** —
they only matter before real students start using it.

## 1. Production environment variables (when you deploy)

Add these to your host's project env settings (Vercel/etc.). **Without the `R2_*` vars,
file uploads silently fall back to Supabase Storage instead of Cloudflare R2 — no error,
just files in the wrong place.**

- [ ] `R2_ACCOUNT_ID`
- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_BUCKET=momlib-resources`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the usual Supabase pair)

## 2. Cloudflare R2 billing alert

- [ ] Cloudflare dashboard → **Notifications** → add a billing/usage alert with a low
  threshold. Expected cost is ~**$0/mo** (10 GB free, no egress fees); this is just peace of mind.

## 3. Email for signups & password resets

Supabase's built-in auth email is rate-limited (a few per hour) — fine for testing, not for
real enrollment. Before real signups:

- [ ] Create a **Resend** account (free: 3,000 emails/mo, 100/day).
- [ ] Add + verify your domain in Resend (add the DNS records it gives you).
- [ ] Create SMTP credentials in Resend.
- [ ] Paste host / port / user / pass + sender (e.g. `noreply@yourdomain`) into
  **Supabase → Auth → SMTP Settings**.
- [ ] Heads-up: the 100/day cap can throttle a big same-day enrollment — Brevo's free
  300/day or a one-month paid Resend bump are fallbacks.

## 4. Merge the build to `main`

- [x] Open/merge the PR (`main ← claude/portal-build`) — **done** (PR #7 merged).

## 5. Landing page & SEO follow-ups

- [ ] **Set `NEXT_PUBLIC_SITE_URL`** to your real domain in the hosting env (and `.env.local`).
  It defaults to the placeholder `https://nibras.app` and is used by the page metadata,
  `sitemap.xml`, `robots.txt`, and the Open Graph share image — so search engines and link
  previews point at the right domain.

- [ ] **Replace placeholder testimonials & stats** in `components/landing/testimonials.tsx` with
  real quotes, names, institutions, and numbers before the site is public.
- [ ] **Wire real Stripe (or similar) checkout** so the "Go Pro" CTA becomes an actual purchase.
  Today it routes to `/login?mode=signup` (create account; upsell later) — no billing exists yet.
  Update the homepage + `components/ui/pricing2.tsx` CTAs once checkout is live.
