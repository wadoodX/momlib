import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourseBySlug, getPublishedSubjectsForCourse } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { NodeIcon } from "@/components/customization/node-icon";
import { colorHex } from "@/lib/customization";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { profile } = await requireUser();
  const { courseSlug } = await params;
  const course = await getPublishedCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  const subjects = await getPublishedSubjectsForCourse(course.id);

  return (
    <PageShell
      eyebrow="Subjects"
      title={course.title}
      description={course.description}
      role={profile?.role ?? "student"}
      icon={course.icon}
      color={course.color}
      iconKind="course"
      breadcrumbs={[
        { label: "Courses", href: "/courses" },
        { label: course.title },
      ]}
    >
      {subjects.length === 0 ? (
        <EmptyState title="No published subjects yet" description="Published subjects for this course will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/courses/${course.slug}/${subject.slug}`}
              className="rounded-3xl border border-line bg-card p-6 transition hover:border-sage"
              style={{ borderLeft: `4px solid ${colorHex(subject.color)}` }}
            >
              <div className="flex items-start gap-4">
                <NodeIcon icon={subject.icon} color={subject.color} kind="subject" size="md" />
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-ink">{subject.title}</h2>
                  {subject.description ? <p className="mt-2 text-sm leading-6 text-muted">{subject.description}</p> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
