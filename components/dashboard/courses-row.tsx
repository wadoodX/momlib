import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import { NodeIcon } from "@/components/customization/node-icon";
import type { CourseProgress } from "@/lib/dashboard";

// "Your courses" — every published course with its explored/complete progress.
export function CoursesRow({ courses }: { courses: CourseProgress[] }) {
  if (courses.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Your courses</p>
        <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-gold">
          Browse all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
        {courses.map((course) => (
          <Link
            key={course.courseId}
            href={course.href}
            className="group flex items-start gap-3.5 rounded-3xl border border-line bg-card p-4 transition hover:border-sage"
          >
            <NodeIcon icon={course.icon} color={course.color} kind="course" size="md" className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-ink group-hover:text-sage">{course.title}</h3>
              <p className="mt-0.5 text-xs text-muted">
                {course.subjectCount} {course.subjectCount === 1 ? "subject" : "subjects"}
                {" · "}
                {course.completed > 0 ? `${course.pct}% complete` : "not started"}
              </p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-sage" style={{ width: `${course.pct}%` }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
