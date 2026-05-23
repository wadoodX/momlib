-- Teacher engagement analytics over chapter_views.
--
-- chapter_views RLS only lets a user read their OWN rows. Rather than opening
-- that up so admins can read everyone's rows, we expose aggregate-only
-- SECURITY DEFINER functions guarded by public.is_admin(). Admins get the
-- leaderboard / summary; raw per-user rows are never exposed.

create or replace function public.admin_top_viewed_chapters(limit_count int default 5)
returns table (
  chapter_id uuid,
  title text,
  course_title text,
  subject_title text,
  course_slug text,
  subject_slug text,
  chapter_slug text,
  view_count bigint,
  learner_count bigint,
  last_viewed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as chapter_id,
    c.title,
    co.title as course_title,
    s.title as subject_title,
    co.slug as course_slug,
    s.slug as subject_slug,
    c.slug as chapter_slug,
    count(*) as view_count,
    count(distinct cv.user_id) as learner_count,
    max(cv.viewed_at) as last_viewed_at
  from public.chapter_views cv
  join public.chapters c on c.id = cv.chapter_id
  join public.subjects s on s.id = c.subject_id
  join public.courses co on co.id = s.course_id
  where public.is_admin()
  group by c.id, c.title, c.slug, s.title, s.slug, co.title, co.slug
  order by view_count desc, last_viewed_at desc
  limit greatest(limit_count, 0);
$$;

create or replace function public.admin_engagement_summary()
returns table (
  total_views bigint,
  learners bigint,
  views_7d bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) as total_views,
    count(distinct cv.user_id) as learners,
    count(*) filter (where cv.viewed_at >= now() - interval '7 days') as views_7d
  from public.chapter_views cv
  where public.is_admin();
$$;

revoke all on function public.admin_top_viewed_chapters(int) from public;
revoke all on function public.admin_engagement_summary() from public;
grant execute on function public.admin_top_viewed_chapters(int) to authenticated;
grant execute on function public.admin_engagement_summary() to authenticated;
