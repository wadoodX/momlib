-- Per-day chapter-view counts for the teacher dashboard's activity chart.
--
-- NOTE ON SEMANTICS: chapter_views is an UPSERT table keyed (user_id, chapter_id)
-- — one row per learner per chapter, with viewed_at overwritten on every open.
-- A "day count" here is therefore "user×chapter pairs whose MOST RECENT open
-- fell on that day" — an activity proxy, not an event log. The UI labels this
-- "activity" accordingly. Re-opening an old chapter moves its row to today.
--
-- Days are bucketed by viewed_at::date in the database timezone (UTC on
-- Supabase); the app zero-fills missing days in UTC too (lib/admin/insights.ts).
--
-- Follows the hardened admin-RPC pattern of 20260603140000_guard_admin_rpcs.sql:
-- plpgsql + raise 42501 for non-admins, security definer with pinned search_path,
-- execute granted to authenticated only.

create or replace function public.admin_views_by_day(days_count int default 14)
returns table (
  day date,
  views bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select
      cv.viewed_at::date as day,
      count(*) as views
    from public.chapter_views cv
    where cv.viewed_at >= (current_date - (greatest(days_count, 1) - 1))
    group by cv.viewed_at::date
    order by day;
end;
$$;

revoke all on function public.admin_views_by_day(int) from public, anon;
grant execute on function public.admin_views_by_day(int) to authenticated;
