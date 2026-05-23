import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourses } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";

export default async function CoursesPage() {
  await requireUser();
  const courses = await getPublishedCourses();

  return (
    <PageShell eyebrow="Courses" title="Browse courses" description="Choose a course to view its published subjects and chapters.">
      {courses.length === 0 ? (
        <EmptyState title="No published courses yet" description="Published courses will appear here once your teacher adds them." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-emerald-300/70"
            >
              <h2 className="text-xl font-semibold text-stone-50">{course.title}</h2>
              {course.description ? <p className="mt-3 text-sm leading-6 text-stone-300">{course.description}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
