create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  resource_type text not null check (resource_type in ('pdf', 'ppt', 'doc', 'image', 'link', 'video')),
  file_path text,
  file_name text,
  file_size bigint check (file_size is null or file_size >= 0),
  mime_type text,
  external_url text,
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (file_path is not null or external_url is not null)
);

alter table public.courses enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.resources enable row level security;

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

drop trigger if exists set_subjects_updated_at on public.subjects;
create trigger set_subjects_updated_at
before update on public.subjects
for each row
execute function public.set_updated_at();

drop trigger if exists set_chapters_updated_at on public.chapters;
create trigger set_chapters_updated_at
before update on public.chapters
for each row
execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

create index if not exists courses_order_idx on public.courses (order_index, title);
create index if not exists courses_published_idx on public.courses (is_published, order_index, title);
create index if not exists courses_search_idx on public.courses using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

create index if not exists subjects_course_order_idx on public.subjects (course_id, order_index, title);
create index if not exists subjects_published_idx on public.subjects (is_published, course_id, order_index, title);
create index if not exists subjects_search_idx on public.subjects using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

create index if not exists chapters_subject_order_idx on public.chapters (subject_id, order_index, title);
create index if not exists chapters_published_idx on public.chapters (is_published, subject_id, order_index, title);
create index if not exists chapters_search_idx on public.chapters using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

create index if not exists resources_chapter_order_idx on public.resources (chapter_id, order_index, title);
create index if not exists resources_type_idx on public.resources (resource_type);
create index if not exists resources_published_idx on public.resources (is_published, chapter_id, order_index, title);
create index if not exists resources_search_idx on public.resources using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(file_name, '')));

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Students can read published courses" on public.courses;
create policy "Students can read published courses"
on public.courses
for select
to authenticated
using (is_published = true);

drop policy if exists "Admins can manage subjects" on public.subjects;
create policy "Admins can manage subjects"
on public.subjects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Students can read published subjects" on public.subjects;
create policy "Students can read published subjects"
on public.subjects
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.courses
    where courses.id = subjects.course_id
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage chapters" on public.chapters;
create policy "Admins can manage chapters"
on public.chapters
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Students can read published chapters" on public.chapters;
create policy "Students can read published chapters"
on public.chapters
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.subjects
    join public.courses on courses.id = subjects.course_id
    where subjects.id = chapters.subject_id
      and subjects.is_published = true
      and courses.is_published = true
  )
);

drop policy if exists "Admins can manage resources" on public.resources;
create policy "Admins can manage resources"
on public.resources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Students can read published resources" on public.resources;
create policy "Students can read published resources"
on public.resources
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.chapters
    join public.subjects on subjects.id = chapters.subject_id
    join public.courses on courses.id = subjects.course_id
    where chapters.id = resources.chapter_id
      and chapters.is_published = true
      and subjects.is_published = true
      and courses.is_published = true
  )
);
