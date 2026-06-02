-- Index the chapter_views foreign key on chapter_id. Postgres does not
-- auto-index FK columns, so admin analytics aggregation (admin_top_viewed_chapters)
-- and the ON DELETE CASCADE from chapters would otherwise sequential-scan.
create index if not exists chapter_views_chapter_idx
  on public.chapter_views (chapter_id);
