-- Per-course / per-subject visual identity: a palette color name and a lucide
-- icon name. Both are validated against an app-side registry (so no DB check
-- constraint here), and null means "use the default".
alter table public.courses
  add column if not exists color text,
  add column if not exists icon text;

alter table public.subjects
  add column if not exists color text,
  add column if not exists icon text;
