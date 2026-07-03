# Student Dashboard Overhaul — Design

**Date:** 2026-07-03 · **Status:** Approved (brainstormed with visual companion)

## Context

The current student dashboard (`components/dashboard/student-dashboard.tsx`) is thin: a decorative
search box, three **library-wide** (non-personal) stat cards, a shallow "explored X of Y chapters"
bar, and a "Continue learning" grid. It's visually plainer than the admin "Mission Control" bento
and gives a new student almost nothing. The owner wants a **complete overhaul**: a rich, personal
**bento hub**.

## Approved decisions

- **Layout:** dense overview bento (like admin Mission Control) **crowned by a full-width resume
  hero**. Mobile-friendly (single-column stack on small screens).
- **Progress model:** **manual "Mark complete"** per chapter → real % (per subject, per course,
  overall). Needs one small additive migration + a toggle action.
- **Streaks:** **light "active days"** derived from existing `chapter_views.viewed_at` (no new
  table; approximate by design).
- **Icons:** always `NodeIcon` (curated lucide + per-node color) — **never emojis**. Built from
  theme tokens so light/dark match automatically. "Start here" items have **no icon**.

## Bento cells (top → bottom)

1. **Resume hero** (full-width, `panel-deep` featured) — most-recently-opened chapter + **Resume ▸**,
   an "up next" hint, and the subject's completed count. Empty state → **"Start here → Chapter 1"** +
   **Begin ▸**.
2. **Progress** (wide) — overall % + per-subject bars (subjects the student has engaged with). Empty →
   0% with an encouraging nudge. · **Activity** (beside it) — "Active N of last 7 days" + a 7-dot
   strip + "last opened". Empty → "No activity yet".
3. **Your courses** — course cards with an explored/complete bar (all published courses).
4. **Discover · newly added** (recent chapters by `created_at`) · **Recently viewed** (last opened).
   In the empty state, "Recently viewed" is replaced by **"Start here"** (first chapters, no icons).

## Data model

Migration `supabase/migrations/20260703170000_add_chapter_completed_at.sql`:
```sql
alter table public.chapter_views add column if not exists completed_at timestamptz;
```
`completed_at` null = not complete. Hand-edit `types/database.ts` `chapter_views` Row/Insert/Update to
add `completed_at: string | null`. The existing `recordChapterView` upsert only writes `viewed_at`, so
it never clobbers `completed_at` (PostgREST upserts only the provided columns).

## Code shape (isolation & testability)

- **`lib/dashboard.ts` (new, pure + unit-tested):** `ChapterNode`/`ViewRow` inputs → pure builders
  `buildResume`, `buildRecent`, `buildProgress`, `buildCourses`, `buildActivity(now)`, `buildNewlyAdded`,
  `buildStartHere`. No I/O, no `Date.now()` inside (time passed in) → fully testable.
- **`lib/db/content.ts`:** `getStudentDashboardData()` runs **two** RLS-scoped queries (the published
  chapter tree with subject+course context, and the user's `chapter_views` incl. `completed_at`), then
  calls the pure builders and returns one `DashboardData`. Add `getChapterCompleted(chapterId)` for the
  chapter page's button initial state.
- **`lib/student/progress-actions.ts` (new, `"use server"`):** `setChapterCompleted(chapterId, done)` —
  upserts `chapter_views` with `completed_at = done ? now : null`; `revalidatePath("/dashboard")`.
- **Components (`components/dashboard/*`):** `student-dashboard.tsx` becomes the bento container
  (`grid grid-cols-1 lg:grid-cols-12`); new focused cells `resume-hero.tsx`, `progress-panel.tsx`,
  `activity-card.tsx`, `courses-row.tsx`, `discover-panel.tsx`, `recent-panel.tsx`. Drop the decorative
  search, the library-total StatCards, and the dead `Reveal` wrappers.
- **`components/student/mark-complete-button.tsx` (new, client):** optimistic `useTransition` toggle on
  the chapter page calling `setChapterCompleted`.

## Mobile

Bento is `grid-cols-1` by default; `lg:grid-cols-12` with col-spans only at `lg`. Hero content wraps;
cards stack. Tap targets ≥ 40px; no horizontal overflow.

## Verification

- `lib/__tests__/dashboard.test.ts` covers every pure builder (progress math, active-days windowing,
  resume/up-next, newly-added ordering, empty inputs).
- `npm run lint`, `npm run build` (typecheck), `npm run test`.
- Apply migration via Supabase MCP; regenerate nothing (hand-edit types). Manual E2E: open a chapter →
  Mark complete → dashboard progress reflects it; new account shows the empty/"Start here" variant.

## Out of scope (YAGNI)

Bookmarks/favorites, real streak tables, resource-level or scroll-position resume, recommendations.
```
