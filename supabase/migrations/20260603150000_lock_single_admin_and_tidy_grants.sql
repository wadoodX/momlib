-- Defense-in-depth hardening:
-- 1. Enforce the single-admin invariant at the DB. The app never sets role='admin'
--    (it's done by hand in the DB), but a partial unique index guarantees AT MOST
--    one admin even against a manual mistake or a compromised service key.
-- 2. Revoke EXECUTE on the set_updated_at trigger helper from public/anon, for
--    consistency with the other hardened functions. It's an inert trigger fn
--    (triggers run as the table owner regardless), but the earlier grant-hardening
--    migration didn't cover it.

create unique index if not exists profiles_one_admin_idx
  on public.profiles (role)
  where role = 'admin';

revoke execute on function public.set_updated_at() from public, anon;
