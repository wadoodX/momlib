import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getPublishedCourseBySlug, getPublishedSubjectsForCourse } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { NodeCard } from "@/components/student/node-card";

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
        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
          {subjects.map((subject, index) => (
            <NodeCard
              key={subject.id}
              href={`/courses/${course.slug}/${subject.slug}`}
              title={subject.title}
              description={subject.description}
              icon={subject.icon}
              color={subject.color}
              kind="subject"
              index={index}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
