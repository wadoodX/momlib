import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourseBySlug, getPublishedSubjectsForCourse } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  await requireUser();
  const { courseSlug } = await params;
  const course = await getPublishedCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  const subjects = await getPublishedSubjectsForCourse(course.id);

  return (
    <PageShell eyebrow="Subjects" title={course.title} description={course.description}>
      {subjects.length === 0 ? (
        <EmptyState title="No published subjects yet" description="Published subjects for this course will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/courses/${course.slug}/${subject.slug}`}
              className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-emerald-300/70"
            >
              <h2 className="text-xl font-semibold text-stone-50">{subject.title}</h2>
              {subject.description ? <p className="mt-3 text-sm leading-6 text-stone-300">{subject.description}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
