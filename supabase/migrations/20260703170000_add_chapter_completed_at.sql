-- Manual "mark complete" for the student dashboard: a nullable completion
-- timestamp on chapter_views. null = not complete. Additive and idempotent;
-- the existing recordChapterView upsert only writes viewed_at, so it never
-- clobbers this column.
alter table public.chapter_views
  add column if not exists completed_at timestamptz;
