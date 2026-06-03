-- Make the admin analytics RPCs RAISE for non-admins instead of silently
-- returning an empty result set. Previously each used `where public.is_admin()`,
-- which yields zero rows to a non-admin caller (no data leak, since all callers go
-- through requireAdmin(), but a future caller that forgot to gate would render
-- "0 views / 0 resources" instead of failing). Converting to plpgsql lets us
-- raise a real authorization error (errcode 42501 = insufficient_privilege).
--
-- `create or replace` preserves the existing grants (execute → authenticated,
-- revoked from anon/public) and the signatures are unchanged.
-- `#variable_conflict use_column` makes `order by <alias>` resolve to the SELECT
-- column rather than the same-named OUT parameter.

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
    group by c.id, c.title, c.slug, s.title, s.slug, co.title, co.slug
    order by view_count desc, last_viewed_at desc
    limit greatest(limit_count, 0);
end;
$$;

create or replace function public.admin_engagement_summary()
returns table (
  total_views bigint,
  learners bigint,
  views_7d bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select
      count(*) as total_views,
      count(distinct cv.user_id) as learners,
      count(*) filter (where cv.viewed_at >= now() - interval '7 days') as views_7d
    from public.chapter_views cv;
end;
$$;

create or replace function public.admin_resource_type_breakdown()
returns table (
  resource_type text,
  count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select r.resource_type, count(*) as count
    from public.resources r
    group by r.resource_type;
end;
$$;
