# Nibras (momlib)

A calm, searchable home for Islamic-studies notes. A single teacher publishes a
library of **Courses → Subjects → Chapters → Resources**; students browse,
search, and resume where they left off.

## Stack

- **Next.js (App Router)** + React + TypeScript
- **Tailwind CSS v4** (CSS-first `@theme`; warm "parchment" palette with a `.dark` variant)
- **Supabase** — Postgres + Auth + Storage, accessed via `@supabase/ssr`
- `next-themes` (light/dark/system, persisted per user), `@dnd-kit` (Content Studio reordering), `lucide-react`
- **Vitest** for unit tests

## Getting started

1. **Install**
   ```bash
   npm install
   ```
2. **Environment** — create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
3. **Apply database migrations** (see below).
4. **Run**
   ```bash
   npm run dev      # http://localhost:3000
   ```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run test` / `npm run test:watch` | Vitest |
| `npm run gen:types` | Regenerate `types/database.ts` from the live schema (needs the Supabase CLI + `SUPABASE_PROJECT_ID`) |

## Database migrations

SQL lives in `supabase/migrations/`. Apply **all** of them, in filename order, via
the Supabase dashboard **SQL Editor** or the CLI (`supabase db push`):

- `…_create_profiles.sql` — profiles, the `handle_new_user` trigger, RLS, `is_admin()`
- `…_create_content_schema.sql` — courses/subjects/chapters/resources + RLS
- `…_create_resource_storage.sql` / `…_set_resource_upload_limit.sql` — Storage bucket + policies
- `…_create_chapter_views.sql` — per-user view tracking
- `…_add_profile_theme.sql` — **required**; the app selects `profiles.theme`
- `…_admin_engagement.sql` — admin analytics RPCs (SECURITY DEFINER, `is_admin()`-guarded)
- `…_add_course_subject_customization.sql` — `color` / `icon` columns

> ⚠️ Until `…_add_profile_theme.sql` is applied, the profile query fails and
> **every user is treated as a student** (admins lose access). Apply migrations first.

## Roles

- There is **one teacher/admin** (set `profiles.role = 'admin'` for that account directly in the DB).
- **All sign-ups become students** — enforced by the `handle_new_user` trigger (defaults `role` to `student`) and RLS (users can update their own profile but **not** their role).

## Type generation

`types/database.ts` should mirror the schema. After any migration, regenerate it:

```bash
export SUPABASE_PROJECT_ID=<your-project-ref>
npm run gen:types
```

(Requires the Supabase CLI and a login/access token.)

## Project layout

- `app/` — routes (student pages, `/admin` Content Studio, `/login`, `/settings`, `/reset-password`)
- `components/` — UI (`admin/studio/*`, `student/*`, `dashboard/*`, `ui/*`, `customization/*`)
- `lib/` — `db/` (queries), `admin/` (server actions), `auth/guards.ts`, `customization.ts`, `search-match.ts`, `format.ts`
- `supabase/migrations/` — schema
- `proxy.ts` + `lib/supabase/middleware.ts` — session refresh
