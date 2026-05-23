create table if not exists public.chapter_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

alter table public.chapter_views enable row level security;

create index if not exists chapter_views_recent_idx
  on public.chapter_views (user_id, viewed_at desc);

drop policy if exists "Users can manage own chapter views" on public.chapter_views;
create policy "Users can manage own chapter views"
on public.chapter_views
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
