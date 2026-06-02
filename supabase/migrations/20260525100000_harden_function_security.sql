-- Harden function security per Supabase advisor warnings.
--
-- 1. Pin search_path on set_updated_at (the only definer/trigger function
--    still missing it). The body only touches NEW and now() (pg_catalog),
--    so an empty search_path is safe.
-- 2. Stop SECURITY DEFINER functions from being callable by the anon role.
--    Supabase grants EXECUTE directly to anon/authenticated (not just PUBLIC),
--    so revoke from those roles explicitly:
--      - is_admin: referenced by RLS policies -> keep for authenticated
--      - admin_* RPCs: called by signed-in admins; is_admin() still gates rows
--        -> keep for authenticated
--      - handle_new_user: trigger only, never an RPC -> revoke from both roles

create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
  set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.admin_engagement_summary() from public, anon;
grant execute on function public.admin_engagement_summary() to authenticated;

revoke execute on function public.admin_top_viewed_chapters(integer) from public, anon;   
grant execute on function public.admin_top_viewed_chapters(integer) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
