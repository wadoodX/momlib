insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources',
  'resources',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can manage resource files" on storage.objects;
create policy "Admins can manage resource files"
on storage.objects
for all
to authenticated
using (bucket_id = 'resources' and public.is_admin())
with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists "Authenticated users can read published resource files" on storage.objects;
create policy "Authenticated users can read published resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources
    join public.chapters on chapters.id = resources.chapter_id
    join public.subjects on subjects.id = chapters.subject_id
    join public.courses on courses.id = subjects.course_id
    where resources.file_path = storage.objects.name
      and resources.is_published = true
      and chapters.is_published = true
      and subjects.is_published = true
      and courses.is_published = true
  )
);
