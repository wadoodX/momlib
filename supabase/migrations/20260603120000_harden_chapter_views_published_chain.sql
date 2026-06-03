-- Tighten the chapter_views write policy so a student can only record a view for
-- a chapter whose entire parent chain (course -> subject -> chapter) is published.
--
-- The original policy (20260523180000) checked only row ownership
-- (user_id = auth.uid()) on WITH CHECK, which let a student INSERT a view row for
-- ANY chapter UUID -- including unpublished content. That allowed existence-probing
-- of hidden chapters and polluted the admin engagement analytics
-- (admin_top_viewed_chapters / admin_engagement_summary) with views on content the
-- student was never allowed to see.
--
-- Admins bypass the chain check (they manage all content), matching every other
-- table's RLS in this schema. recordChapterView() only ever runs on the
-- student-facing chapter route, which 404s on any unpublished chain for every role,
-- so this tightening does not affect any legitimate write path.

drop policy if exists "Users can manage own chapter views" on public.chapter_views;
create policy "Users can manage own chapter views"
on public.chapter_views
for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1
      from public.chapters
      join public.subjects on subjects.id = chapters.subject_id
      join public.courses on courses.id = subjects.course_id
      where chapters.id = chapter_views.chapter_id
        and chapters.is_published = true
        and subjects.is_published = true
        and courses.is_published = true
    )
  )
);
