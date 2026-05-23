import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourses } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { NodeIcon } from "@/components/customization/node-icon";
import { colorHex } from "@/lib/customization";

export default async function CoursesPage() {
  const { profile } = await requireUser();
  const courses = await getPublishedCourses();

  return (
    <PageShell eyebrow="Courses" title="Browse courses" description="Choose a course to view its published subjects and chapters." role={profile?.role ?? "student"}>
      {courses.length === 0 ? (
        <EmptyState title="No published courses yet" description="Published courses will appear here once your teacher adds them." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="rounded-3xl border border-line bg-card p-6 transition hover:border-sage"
              style={{ borderLeft: `4px solid ${colorHex(course.color)}` }}
            >
              <div className="flex items-start gap-4">
                <NodeIcon icon={course.icon} color={course.color} kind="course" size="md" />
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-ink">{course.title}</h2>
                  {course.description ? <p className="mt-2 text-sm leading-6 text-muted">{course.description}</p> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
