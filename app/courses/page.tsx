import { requireUser } from "@/lib/auth/guards";
import {
  getPublishedCoursesWithCounts,
  getPublishedSubjectsForCourse,
  searchPublishedResources,
  searchPublishedStructure,
} from "@/lib/db/content";
import { searchAllResources, searchAllStructure } from "@/lib/db/admin-content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { NodeCard } from "@/components/student/node-card";
import { NodeIcon } from "@/components/customization/node-icon";
import { CoursesSidebar } from "@/components/student/courses-sidebar";
import { SearchResults } from "@/components/student/search-results";

type CoursesPageProps = {
  searchParams: Promise<{ course?: string; q?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { profile } = await requireUser();
  const role = profile?.role ?? "student";
  const isAdmin = role === "admin";

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const isSearching = query.length >= 2;

  const courses = await getPublishedCoursesWithCounts();

  // No content at all — keep the simple full-width empty state (no rail).
  if (courses.length === 0) {
    return (
      <PageShell
        eyebrow="Courses"
        title="Browse courses"
        description="Choose a course to view its published subjects, or search across everything."
        role={role}
      >
        <EmptyState
          title="No published courses yet"
          description="Published courses will appear here once your teacher adds them."
        />
      </PageShell>
    );
  }

  // While searching no course is selected; otherwise auto-open the first course.
  const selected = isSearching ? null : courses.find((c) => c.slug === params.course) ?? courses[0];

  let middle: React.ReactNode;

  if (isSearching) {
    const [structure, resources] = await Promise.all([
      isAdmin ? searchAllStructure(query) : searchPublishedStructure(query),
      isAdmin ? searchAllResources(query) : searchPublishedResources(query),
    ]);

    middle = (
      <div>
        <h2 className="mb-6 text-lg font-semibold text-ink">
          Results for <span className="text-gold">&ldquo;{query}&rdquo;</span>
        </h2>
        <SearchResults structure={structure} resources={resources} isAdmin={isAdmin} query={query} />
      </div>
    );
  } else if (selected) {
    const subjects = await getPublishedSubjectsForCourse(selected.id);

    middle = (
      <div>
        <header className="mb-6 flex items-start gap-4">
          <NodeIcon icon={selected.icon} color={selected.color} kind="course" size="lg" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{selected.title}</h2>
            {selected.description ? (
              <p className="mt-1 text-sm leading-6 text-muted">{selected.description}</p>
            ) : (
              <p className="mt-1 text-sm text-muted">
                {selected.subjectCount} {selected.subjectCount === 1 ? "subject" : "subjects"}
              </p>
            )}
          </div>
        </header>

        {subjects.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            description="Published subjects for this course will appear here."
          />
        ) : (
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
            {subjects.map((subject, index) => (
              <NodeCard
                key={subject.id}
                href={`/courses/${selected.slug}/${subject.slug}`}
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
      </div>
    );
  }

  return (
    <PageShell
      eyebrow="Courses"
      title="Browse courses"
      description="Choose a course to view its published subjects, or search across everything."
      role={role}
    >
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <CoursesSidebar courses={courses} activeSlug={selected?.slug ?? null} query={query} />
        <div className="min-w-0 flex-1">{middle}</div>
      </div>
    </PageShell>
  );
}
