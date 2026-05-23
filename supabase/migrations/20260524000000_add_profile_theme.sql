-- Per-user theme preference, saved to the profile so it follows the user
-- across devices. Defaults to 'system' (follow the OS setting).
alter table public.profiles
  add column if not exists theme text not null default 'system'
  check (theme in ('light', 'dark', 'system'));

-- The existing "Users can update own non-role profile fields" policy already
-- allows updating this column (its WITH CHECK only pins the role), so no new
-- policy is required.
