import { notFound, redirect } from "next/navigation";
import {
  getPublishedChaptersForSubject,
  getPublishedCourseBySlug,
  getPublishedSubjectBySlug,
} from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";

type SubjectPageProps = {
  params: Promise<{ courseSlug: string; subjectSlug: string }>;
};

// The subject index opens straight into the first chapter (Udemy-style): the
// layout renders the chapter rail, and this redirect lands the content pane on
// chapter 1. With no chapters, it shows the empty state inside the layout shell.
export default async function SubjectPage({ params }: SubjectPageProps) {
  const { courseSlug, subjectSlug } = await params;

  const course = await getPublishedCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const subject = await getPublishedSubjectBySlug(course.id, subjectSlug);
  if (!subject) {
    notFound();
  }

  const chapters = await getPublishedChaptersForSubject(subject.id);

  if (chapters.length === 0) {
    return (
      <EmptyState
        title="No published chapters yet"
        description="Published chapters for this subject will appear here."
      />
    );
  }

  redirect(`/courses/${courseSlug}/${subjectSlug}/${chapters[0].slug}`);
}
