import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedChaptersForSubject, getPublishedCourseBySlug, getPublishedSubjectBySlug } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";

type SubjectPageProps = {
  params: Promise<{ courseSlug: string; subjectSlug: string }>;
};

export default async function SubjectPage({ params }: SubjectPageProps) {
  await requireUser();
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

  return (
    <PageShell eyebrow={course.title} title={subject.title} description={subject.description}>
      {chapters.length === 0 ? (
        <EmptyState title="No published chapters yet" description="Published chapters for this subject will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/courses/${course.slug}/${subject.slug}/${chapter.slug}`}
              className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-emerald-300/70"
            >
              <h2 className="text-xl font-semibold text-stone-50">{chapter.title}</h2>
              {chapter.description ? <p className="mt-3 text-sm leading-6 text-stone-300">{chapter.description}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
