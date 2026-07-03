import { notFound } from "next/navigation";
import {
  getChapterCompleted,
  getPublishedChapterBySlug,
  getPublishedCourseBySlug,
  getPublishedResourcesForChapter,
  getPublishedSubjectBySlug,
  recordChapterView,
} from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { ResourceCard } from "@/components/student/resource-card";
import { MarkCompleteButton } from "@/components/student/mark-complete-button";

type ChapterPageProps = {
  params: Promise<{ courseSlug: string; subjectSlug: string; chapterSlug: string }>;
};

// The content pane inside the subject layout. The layout supplies the shell,
// breadcrumbs, and chapter rail; this renders the selected chapter's heading and
// resources. Auth is enforced by the layout's requireUser(); the course/subject
// reads here are cache()-deduped with the layout's.
export default async function ChapterPage({ params }: ChapterPageProps) {
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

  // Track "last read" for the dashboard's resume/recent, then read completion
  // for the Mark-complete button's initial state.
  await recordChapterView(chapter.id);
  const completed = await getChapterCompleted(chapter.id);

  return (
    <article>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{chapter.title}</h2>
          {chapter.description ? (
            <p className="mt-2 text-base leading-7 text-muted">{chapter.description}</p>
          ) : null}
        </div>
        <MarkCompleteButton chapterId={chapter.id} initialCompleted={completed} />
      </header>

      {resources.length === 0 ? (
        <EmptyState
          title="No published resources yet"
          description="Published resources for this chapter will appear here."
        />
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </article>
  );
}
