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
- [ ] **Enable leaked-password protection** in Supabase → Auth (HaveIBeenPwned check). Currently off.

### Content / product
- [ ] **Add real content.** The library currently has only **1 chapter / 1 resource** across 48
  published subjects, so most subjects render empty until chapters are added.
- [ ] **Replace placeholder testimonials & stats** in `components/landing/testimonials.tsx` with
  real quotes/names/institutions/numbers before the site is public.
- [ ] **Wire real Stripe (or similar) checkout** for "Go Pro" (homepage + `components/ui/pricing2.tsx`).
  Today it routes to `/login?mode=signup` — no billing exists yet.

---

## Optional / nice-to-have (not blocking)

- [x] **Harden `Reveal`/`Hero` to default to visible** — **done** (2026-06-03). `Reveal` now uses an
  IntersectionObserver that adds a CSS `.reveal--in` class (content visible by default); `Hero` uses
  the pure-CSS `.hero-rise` entrance and is now a server component (LCP `<h1>` ships as static HTML).
  `motion` dependency removed (lantern uses a local `matchMedia` reduced-motion hook). Verified: SSR
  HTML went from 26 content `opacity:0` styles → 0, so a JS failure no longer blanks the page.
- [ ] **Reconcile Supabase migration history** (low urgency — live schema is correct and all 14
  migrations are idempotent, so a fresh `supabase db push` is safe). The remote
  `schema_migrations` table tracks only a few migrations under MCP-generated timestamps that differ
  from the repo filenames. To make local files the source of truth: `supabase link`, then
  `supabase migration list` (shows the diff), then `supabase migration repair --status applied
  <version>` for each repo migration (and `--status reverted <version>` for stale remote-only rows).
- [ ] **CI coverage reporting** (`@vitest/coverage-v8` + threshold). Low value while only
  helpers/guards are tested.
- [ ] **`reorder` single-RPC atomicity** — currently N parallel updates; partial failure now
  surfaces an error but isn't transactional (`lib/admin/studio-actions.ts`).
- [ ] **Eyeball the de-pill visual changes** in the running app (chips → tracked text, etc.).
- [ ] **Monitor 2 moderate npm advisories** (transitive `postcss` via `next`, build-time only). Not
  fixable without downgrading Next — do **not** `npm audit fix --force`; clear when a Next 16.x patch
  bumps its vendored `postcss`.

**Deliberately skipped:** keep `public/models/lantern.glb` (gitignored local source asset — never
deploys); keep `…_set_resource_upload_limit.sql` (redundant no-op, but already applied — removing
an applied migration is more risk than the cosmetic gain).

---

## Path to 10/10 (deferred — implement later)

After three converging review rounds the codebase sits at ~A (9.0). The gap to 10/10 is **earned
confidence + launch-readiness, not more nitpicks**. Ranked by leverage.

### Tier 1 — prove the invariants (highest leverage)
- [ ] **RLS integration tests against a real Postgres** (local Supabase / a throwaway branch, or
  pgTAP). Seed an admin + a student and assert the ACTUAL DB behavior, not just query shapes:
  - student gets empty/404 for an unpublished course/subject/chapter/resource (full chain);
  - student CANNOT insert a `chapter_views` row for an unpublished chapter, but CAN for a published one;
  - the admin RPCs (`admin_*`) raise for a student, return data for the admin;
  - a student cannot change their own `role`; the single-admin unique index blocks a 2nd admin.
- [ ] **Playwright E2E smoke suite** for flows nothing covers today: signup → dashboard; browse a
  published chapter; admin create/publish content; AND a `javaScriptEnabled:false` test asserting the
  hero `<h1>` + a dashboard card have `opacity:1` (locks in the round-2 blank-page fix).
- [ ] **Test `duplicateNode` + rollback** (`lib/admin/studio-actions.ts`) — recursive course clone
  with R2 file copy + best-effort rollback; the most complex untested code.

### Tier 2 — production-grade
- [ ] **Real error tracking** (Sentry or equivalent). Today `app/error.tsx` only `console.error`s —
  prod failures are invisible. Wire client + server error reporting.
- [ ] Run the E2E suite + a **coverage gate** in CI (see "CI coverage reporting" above).
- [ ] (already tracked above) migration-history reconcile; the full "Before real students sign up"
  checklist (R2 / `NEXT_PUBLIC_SITE_URL` / SMTP / leaked-password / Stripe); real content; replace
  placeholder testimonials.

### Tier 3 — polish (immaterial at current scale)
- [ ] Perf advisors: wrap `auth.uid()` → `(select auth.uid())` in the `chapter_views` policy
  (RLS init-plan); add an index on `created_by`; pause/lazy-load the lantern `useFrame` once scrolled
  past the hero.
- [ ] Formal a11y pass — axe + Lighthouse + a screen-reader run of the admin DnD.
- [ ] Commit a `.env.example` (already allowed by `.gitignore`) for onboarding.

> Stop-hedging line: the published-chain rule has an integration test running in CI, prod errors are
> tracked, and the launch checklist is done. **Tier 1 ≈ 80% of the perceived gap.**

---

## Done

- [x] **Merge** — PR #7 merged (`main ← claude/portal-build`).

### Code-review remediation — 2026-06-03 multi-agent review (all addressed · 65 tests green)
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
