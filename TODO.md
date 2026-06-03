# TODO — Nibras

Pre-launch checklist and tracked follow-ups. **Nothing here blocks local development.**

---

## Before real students sign up

### Deploy / infrastructure
- [ ] **Production env vars** (host project settings — Vercel/etc.):
  `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=momlib-resources`,
  plus `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  *Without the `R2_*` vars, uploads silently fall back to Supabase Storage — no error, wrong place.*
- [ ] **Cloudflare R2 billing/usage alert** (dashboard → Notifications, low threshold).
  ~$0/mo expected (10 GB free, no egress); peace of mind only.
- [ ] **Auth email via SMTP** — Supabase's built-in email is rate-limited (a few/hour). Create a
  **Resend** account (free 3k/mo, 100/day), verify your domain, create SMTP creds, paste
  host/port/user/pass + sender into **Supabase → Auth → SMTP Settings**. (Brevo 300/day or a paid
  Resend bump if a big same-day enrollment hits the 100/day cap.)
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** to your real domain (hosting env + `.env.local`). Defaults to
  the placeholder `https://nibras.app`; used by metadata, `sitemap.xml`, `robots.txt`, OG image.

### Content / product
- [ ] **Add real content.** The library currently has only **1 chapter / 1 resource** across 48
  published subjects, so most subjects render empty until chapters are added.
- [ ] **Replace placeholder testimonials & stats** in `components/landing/testimonials.tsx` with
  real quotes/names/institutions/numbers before the site is public.
- [ ] **Wire real Stripe (or similar) checkout** for "Go Pro" (homepage + `components/ui/pricing2.tsx`).
  Today it routes to `/login?mode=signup` — no billing exists yet.

---

## Optional / nice-to-have (not blocking)

- [ ] **Harden `Reveal`/`Hero` to default to visible** (animation as progressive enhancement).
  Today the whole site animates in from `opacity:0` via JS, so any JS-load failure leaves the page
  blank — this was the root cause of the "blank page when opened via the LAN IP" confusion (now
  worked around with `allowedDevOrigins`).
- [ ] **CI coverage reporting** (`@vitest/coverage-v8` + threshold). Low value while only
  helpers/guards are tested.
- [ ] **`reorder` single-RPC atomicity** — currently N parallel updates; partial failure now
  surfaces an error but isn't transactional (`lib/admin/studio-actions.ts`).
- [ ] **Eyeball the de-pill visual changes** in the running app (chips → tracked text, etc.).

**Deliberately skipped:** keep `public/models/lantern.glb` (gitignored local source asset — never
deploys); keep `…_set_resource_upload_limit.sql` (redundant no-op, but already applied — removing
an applied migration is more risk than the cosmetic gain).

---

## Done

- [x] **Merge** — PR #7 merged (`main ← claude/portal-build`).

### Code-review remediation — 2026-06-03 multi-agent review (all addressed · 59 tests green)
- **Security / RLS:** `chapter_views` writes now require a fully-published chapter chain
  (migration applied to live DB); all `/admin/*` routes guarded at `app/admin/layout.tsx`;
  `requireUser()` throws on a missing profile; +12 security tests (`guards.test.ts`,
  `content-published.test.ts`).
- **Backend:** `getResourceTypeBreakdown` → one grouped RPC (`admin_resource_type_breakdown`,
  applied live); `reorder` capped + error-surfacing; slug `like`-prefix over-match fixed.
- **Theming / UI:** added `--color-destructive` token (fixes `button.tsx`'s undefined classes +
  all off-theme reds); de-pilled chips/buttons per `DESIGN_PRINCIPLES.md`; favicon (`app/icon.svg`);
  marketing-page theme toggle; `error.tsx` now logs.
- **Tooling:** pinned all `latest` deps + dropped 2 unused Radix deps; CI `typecheck` step +
  concurrency cancel; `engines.node` + `.nvmrc`; README migration list; removed dead
  components/CSS.
- **Dev environment:** added `allowedDevOrigins` so the dev server is reachable from the LAN IP
  (`next.config.ts`).

### Investigated — NOT a bug (do not re-raise)
- **`proxy.ts` is correct, not "inactive middleware."** Next.js 16 renamed `middleware.ts` →
  `proxy.ts` (export `proxy`); the build registers it (`ƒ Proxy (Middleware)`) and session refresh
  works via `updateSession()` → `supabase.auth.getUser()`. **Do not rename it to `middleware.ts`.**
