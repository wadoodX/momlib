# Momlib Project Plan

Momlib is a production-style student resource portal for Alimiyyah and Islamic Studies notes. The app organizes PDFs, PPT/PPTX, DOC/DOCX, images, external links, and later videos into a secure learning hierarchy.

## Core Hierarchy

```text
Course -> Subject -> Chapter -> Resource
```

## Roles

### Teacher/Admin

- Can log in.
- Can create, edit, and delete courses.
- Can create, edit, and delete subjects.
- Can create, edit, and delete chapters.
- Can upload, edit, and delete resources/files.
- Can manage student access later.

### Student

- Can log in.
- Can view courses, subjects, chapters, and resources.
- Can search resources.
- Cannot upload, edit, or delete anything.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage

## Database Schema

### `profiles`

```text
id uuid primary key references auth.users(id) on delete cascade
full_name text
role text -- admin, student
created_at timestamptz
updated_at timestamptz
```

### `courses`

```text
id uuid primary key
title text
slug text unique
description text
order_index int
is_published boolean
created_by uuid references auth.users(id)
created_at timestamptz
updated_at timestamptz
```

### `subjects`

```text
id uuid primary key
course_id uuid references courses(id) on delete cascade
title text
slug text
description text
order_index int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

### `chapters`

```text
id uuid primary key
subject_id uuid references subjects(id) on delete cascade
title text
slug text
description text
order_index int
is_published boolean
created_at timestamptz
updated_at timestamptz
```

### `resources`

```text
id uuid primary key
chapter_id uuid references chapters(id) on delete cascade
title text
description text
resource_type text -- pdf, ppt, doc, image, link, video
file_path text
file_name text
file_size bigint
mime_type text
external_url text
order_index int
is_published boolean
created_by uuid references auth.users(id)
created_at timestamptz
updated_at timestamptz
```

### Future `student_course_access`

```text
id uuid primary key
student_id uuid references profiles(id) on delete cascade
course_id uuid references courses(id) on delete cascade
status text -- active, revoked, pending
granted_by uuid references auth.users(id)
created_at timestamptz
```

## Search Support

Use full-text indexes on:

- `courses.title`, `courses.description`
- `subjects.title`, `subjects.description`
- `chapters.title`, `chapters.description`
- `resources.title`, `resources.description`, `resources.file_name`

## Storage Plan

Supabase Storage bucket:

```text
resources
```

Suggested object paths:

```text
courses/{course_id}/subjects/{subject_id}/chapters/{chapter_id}/{resource_id}-{filename}
```

Storage uploads/deletes should be admin-only. Storage reads should only be available to authenticated users who can access the related resource.

## RLS Direction

- Do not disable Supabase RLS.
- Admins can select, insert, update, and delete courses, subjects, chapters, and resources.
- Students can only select published rows.
- Students cannot insert, update, or delete course content.
- If course access is enabled later, students should only select content for courses where they have active access.
- Do not rely only on hidden UI controls; enforce permissions in RLS and server-side checks.

## Folder Structure Direction

```text
momlib/
  app/
    layout.tsx
    page.tsx
    (auth)/
      login/
        page.tsx
      logout/
        route.ts
    dashboard/
      page.tsx
    admin/
      page.tsx
    courses/
      page.tsx
      [courseSlug]/
        page.tsx
        [subjectSlug]/
          page.tsx
          [chapterSlug]/
            page.tsx
  components/
    ui/
    layout/
    auth/
    student/
    admin/
    resources/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth/
      guards.ts
    db/
      courses.ts
      subjects.ts
      chapters.ts
      resources.ts
    validators/
  types/
    database.ts
  supabase/
    migrations/
  public/
```

## Milestones

1. Project foundation: Next.js, TypeScript, Tailwind, Supabase helpers, env variables, and basic routing.
2. Auth and roles: Supabase login, `profiles`, admin/student roles, protected routes, and admin guard.
3. Database and RLS: `courses`, `subjects`, `chapters`, `resources`, indexes, and strict RLS.
4. Student browsing experience: read-only course, subject, chapter, resource pages, downloads, and search.
5. Admin content management: CRUD for courses, subjects, chapters, resources, and Supabase Storage uploads.

## Current Progress

- Milestone 1 complete: foundation app is implemented.
- Milestone 2 complete: auth and role foundation works with tested admin/student accounts.
- Milestone 3 complete: content schema migration, RLS policies, indexes, and TypeScript database types are implemented.
- Milestone 4 complete in code: student course browsing, nested subject/chapter/resource pages, and basic resource search are implemented.
- Milestone 5 complete in code: admin content management, file uploads, external links, Gamma links, and protected storage policies are implemented.
- Resource display supports inline previews for images, PDFs, videos, Gamma links, and Office document/presentation embeds where supported by the browser/provider.

## Security Rules

- Do not use the Supabase service role key in frontend code.
- Do not expose admin functions to students.
- Do not allow students to access unpublished resources through direct URLs.
- Do not make the storage bucket fully public unless every file is intended to be public.
- Validate uploaded file types and sizes.
- Sanitize file names before upload.
- Use admin checks on every mutation, not just admin pages.
- Avoid trusting `role` values from the browser.
- Validate external links before saving.
- Keep `.env.local` out of Git.
- Add RLS policies before adding real student data or real files.
