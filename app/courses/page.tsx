import { requireUser } from "@/lib/auth/guards";
import { getPublishedCoursesWithCounts } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { NodeCard } from "@/components/student/node-card";

export default async function CoursesPage() {
  const { profile } = await requireUser();
  const courses = await getPublishedCoursesWithCounts();

  return (
    <PageShell eyebrow="Courses" title="Browse courses" description="Choose a course to view its published subjects and chapters." role={profile?.role ?? "student"}>
      {courses.length === 0 ? (
        <EmptyState title="No published courses yet" description="Published courses will appear here once your teacher adds them." />
      ) : (
        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
          {courses.map((course, index) => (
            <NodeCard
              key={course.id}
              href={`/courses/${course.slug}`}
              title={course.title}
              description={course.description}
              icon={course.icon}
              color={course.color}
              kind="course"
              meta={`${course.subjectCount} ${course.subjectCount === 1 ? "subject" : "subjects"}`}
              index={index}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
