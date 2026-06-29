import { Link } from "next-view-transitions";
import { Search } from "lucide-react";
import type { CourseWithCount } from "@/lib/db/content";
import { NodeIcon } from "@/components/customization/node-icon";
import { cn } from "@/lib/utils";

type CoursesSidebarProps = {
  courses: CourseWithCount[];
  /** Slug of the course currently shown in the middle pane (null while searching). */
  activeSlug: string | null;
  /** Current `?q` value, kept in the search input across navigations. */
  query: string;
};

/** GET form that sets `?q` and drops `?course`, so search takes over the middle. */
function SearchBox({ query }: { query: string }) {
  return (
    <form action="/courses" method="get" className="mb-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search everything"
          aria-label="Search courses, subjects, chapters, and resources"
          className="min-h-11 w-full rounded-2xl border border-line bg-paper-soft pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-sage"
        />
      </div>
    </form>
  );
}

function CourseList({ courses, activeSlug }: { courses: CourseWithCount[]; activeSlug: string | null }) {
  return (
    <ol className="space-y-1">
      {courses.map((course) => {
        const active = course.slug === activeSlug;

        return (
          <li key={course.id}>
            <Link
              href={`/courses?course=${course.slug}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition",
                active
                  ? "border-sage bg-sage/10 text-ink"
                  : "border-transparent text-muted hover:border-line hover:bg-card hover:text-ink",
              )}
            >
              <NodeIcon icon={course.icon} color={course.color} kind="course" size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium leading-snug">{course.title}</span>
                <span className="block text-xs text-muted">
                  {course.subjectCount} {course.subjectCount === 1 ? "subject" : "subjects"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Course rail for the /courses explorer — a sibling of the chapter rail one level
 * up. Server-safe (active course is passed in from the page, not derived from the
 * URL), so it carries the inline search box and the published-course list. On
 * phones it collapses into a <details> "Courses" disclosure above the content.
 */
export function CoursesSidebar({ courses, activeSlug, query }: CoursesSidebarProps) {
  return (
    <>
      {/* Phones: collapsible disclosure above the content. */}
      <details className="mb-6 rounded-2xl border border-line bg-card lg:hidden">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink">
          Courses ({courses.length})
        </summary>
        <div className="px-2 pb-2">
          <SearchBox query={query} />
          <CourseList courses={courses} activeSlug={activeSlug} />
        </div>
      </details>

      {/* Desktop: sticky left rail. */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-10">
          <SearchBox query={query} />
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Courses</p>
          <CourseList courses={courses} activeSlug={activeSlug} />
        </div>
      </aside>
    </>
  );
}
