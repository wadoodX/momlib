import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourseBySlug } from "@/lib/db/content";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

// The course's subjects now live in the /courses explorer's middle pane. This
// route stays as a canonical deep link (breadcrumbs, search results, bookmarks):
// it validates the slug (404 on a bad/unpublished one) and redirects into the
// explorer with that course selected.
export default async function CoursePage({ params }: CoursePageProps) {
  await requireUser();
  const { courseSlug } = await params;
  const course = await getPublishedCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  redirect(`/courses?course=${course.slug}`);
}
