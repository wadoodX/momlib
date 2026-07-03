# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nibras (`momlib`) — a Next.js + Supabase portal for Islamic-studies content. One teacher/admin
publishes a library of **Courses → Subjects → Chapters → Resources**; students browse, search,
and resume. Warm "parchment" aesthetic with light/dark themes.

## Commands

```bash
npm run dev            # dev server (Turbopack) at http://localhost:3000
npm run build          # production build (also runs tsc)
npm run lint           # eslint .
npm run test           # vitest run (all unit tests)
npm run test:watch     # vitest watch
npx vitest run lib/__tests__/format.test.ts        # a single test file
npx vitest run -t "parseNodeDescription"           # tests matching a name
npm run gen:types      # regenerate types/database.ts from the live schema (needs Supabase CLI + SUPABASE_PROJECT_ID)
```

Tests live in `lib/__tests__/*.test.ts` and cover **pure helpers** (slug, search-match, format,
storage routing, storage-cleanup) plus the **security-critical layer** via fake/recording Supabase
clients: auth guards (`guards.test.ts`) and the published-chain query filters
(`content-published.test.ts`). UI and most DB-mutation code is still not unit-tested.

## Environment

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. File storage
optionally uses the four `R2_*` vars (see Storage below). `gen:types` needs `SUPABASE_PROJECT_ID`.

## Architecture

**Auth & roles** — `lib/auth/guards.ts`. `requireUser()` (wrapped in React `cache()` so a page and
its shell dedupe to one read) redirects to `/login` and loads the `profiles` row; it **throws on a
profile-load error** rather than silently downgrading. `requireAdmin()` redirects non-admins to
`/dashboard`. There is exactly **one admin** (set `profiles.role = 'admin'` directly in the DB);
all sign-ups become students, enforced by the `handle_new_user` trigger + RLS.

**Supabase access** — three clients in `lib/supabase/`: `server.ts` (`createClient()`, cookie-based
SSR — used by server components and actions), `client.ts` (browser), and `middleware.ts` (session
refresh, wired via root `proxy.ts`). Auth/data security lives in **Postgres RLS**, not the app.

**Data model & the "published chain" rule** — courses → subjects → chapters → resources, each with
`is_published`. RLS exposes a row to a student only when its **entire parent chain is published**.
Student-facing queries in `lib/db/content.ts` mirror this (filter `is_published` up the chain);
admin reads are in `lib/db/admin-content.ts`. Search (`lib/search-match.ts` + the `search*` fns in
`content.ts`) pushes ILIKE filters into the DB so `LIMIT` caps real matches, not a fetch window.

**Admin Content Studio** (`/admin`) — `components/admin/studio/*`: a `@dnd-kit` tree
(`tree-nav.tsx`) + detail pane, driven by **server actions** in `lib/admin/*-actions.ts`
(`quickAdd`, `reorder`, `renameNode`, `setPublished`, `duplicateNode`, `deleteNode`, file CRUD).
Selection lives in the URL (`?course=/subject=/chapter=`).

**File storage** — go through `lib/storage/resources.ts` (`uploadResource`, `signedResourceUrl`,
`removeResources`, `copyResource`); **never call `supabase.storage` directly.** It uses Cloudflare
R2 (`lib/storage/r2.ts`) when all four `R2_*` env vars are set, and falls back to Supabase Storage
otherwise. `resources.file_path` is the object key for both backends; files are private, served via
1-hour presigned URLs (`addResourceHref`). External-link resources use `external_url` instead.

**Customization** — `lib/customization.ts` defines the curated `COLORS` (8) and `ICONS` (16, lucide)
that courses/subjects carry as `color`/`icon`. Render them with `<NodeIcon>` and `colorHex()`
(`components/customization/node-icon.tsx`) — server-safe, reads correctly in light/dark.

**Theming** — Tailwind **v4 with no config file**: design tokens are CSS variables in the `@theme`
block of `app/globals.css`, and the `.dark` class redefines them so the whole app reflows. Use
token classes (`bg-paper`, `text-ink`, `text-muted`, `border-line`, `text-gold`, `bg-sage`,
`bg-card`) — **don't hardcode hex or add `dark:` variants.** `next-themes` (`components/theme-*.tsx`)
manages light/dark/system and `ThemeSync` persists it to `profiles.theme`.

## Conventions & gotchas

- **Slugs** must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`; `courses.slug` is unique. Titles are plain
  ASCII (transliterations, no diacritics).
- **Subject `description`** uses the convention `"Core Module · Core text: <book>"` /
  `"Optional Module · …"` (stored, still editable in the studio). For display, `NodeCard`
  and the subject header show only the substance via `cleanNodeDescription()` (`lib/format.ts`),
  which strips the module status + `"Core text:"` label (e.g. → `"<book>"`); the underlying
  `parseNodeDescription()` split is still available. Subjects inherit their course's `color`.
- **Card grids** use `grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]`; the signed-in
  shell (`components/student/page-shell.tsx`) is full-width (no max-width cap).
- **Migrations** in `supabase/migrations/` must be applied in filename order (dashboard SQL editor
  or `supabase db push`). Until `…_add_profile_theme.sql` is applied the profile query fails and
  `requireUser()` **throws on every page** (it no longer silently downgrades to student — apply
  migrations first). Run `gen:types` after schema changes.
- `created_by` columns default to `auth.uid()` and are `NOT NULL` — when inserting over a service
  connection (e.g. MCP) you must set them explicitly.
- **Deploying:** add the `R2_*` vars to the hosting environment too, or production silently falls
  back to Supabase Storage.

## MCP

`.mcp.json` configures a **supabase** MCP server (used for schema/data on project
`tgpfvefnvrwaynwcpjsb`) and two **cloudflare** servers. Prefer the Supabase MCP for DB inspection
and migrations.
