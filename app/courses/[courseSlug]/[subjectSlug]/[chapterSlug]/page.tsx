import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  getPublishedChapterBySlug,
  getPublishedCourseBySlug,
  getPublishedResourcesForChapter,
  getPublishedSubjectBySlug,
  recordChapterView,
} from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { ResourceCard } from "@/components/student/resource-card";

type ChapterPageProps = {
  params: Promise<{ courseSlug: string; subjectSlug: string; chapterSlug: string }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { profile } = await requireUser();
  const { courseSlug, subjectSlug, chapterSlug } = await params;
  const course = await getPublishedCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  const subject = await getPublishedSubjectBySlug(course.id, subjectSlug);

  if (!subject) {
    notFound();
  }

  const chapter = await getPublishedChapterBySlug(subject.id, chapterSlug);

  if (!chapter) {
    notFound();
  }

  const resources = await getPublishedResourcesForChapter(chapter.id);

  // Track "last read" for the student dashboard's Continue learning list.
  await recordChapterView(chapter.id);

  return (
    <PageShell
      eyebrow={`${course.title} / ${subject.title}`}
      title={chapter.title}
      description={chapter.description}
      role={profile?.role ?? "student"}
      breadcrumbs={[
        { label: "Courses", href: "/courses" },
        { label: course.title, href: `/courses/${course.slug}` },
        { label: subject.title, href: `/courses/${course.slug}/${subject.slug}` },
        { label: chapter.title },
      ]}
    >
      {resources.length === 0 ? (
        <EmptyState title="No published resources yet" description="Published resources for this chapter will appear here." />
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
