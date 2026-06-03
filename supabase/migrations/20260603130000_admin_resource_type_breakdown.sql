-- Aggregate resource counts grouped by type for the admin dashboard, in one round
-- trip instead of six `count: exact, head` queries (one per resource type).
--
-- Mirrors the admin_engagement_* pattern: SECURITY DEFINER, search_path pinned,
-- is_admin() in the WHERE so a non-admin caller gets zero rows, anon revoked.

create or replace function public.admin_resource_type_breakdown()
returns table (
  resource_type text,
  count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select r.resource_type, count(*) as count
  from public.resources r
  where public.is_admin()
  group by r.resource_type;
$$;

revoke all on function public.admin_resource_type_breakdown() from public, anon;
grant execute on function public.admin_resource_type_breakdown() to authenticated;
