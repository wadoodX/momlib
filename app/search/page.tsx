import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { searchPublishedResources, searchPublishedStructure } from "@/lib/db/content";
import { searchAllResources, searchAllStructure } from "@/lib/db/admin-content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { ResourceCard } from "@/components/student/resource-card";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function ResultRow({ href, title, trail, draft }: { href: string; title: string; trail?: string; draft?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4 transition hover:border-sage"
    >
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-ink">{title}</h3>
        {trail ? <p className="mt-0.5 truncate text-xs uppercase tracking-[0.15em] text-muted">{trail}</p> : null}
      </div>
      {draft ? (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Draft</span>
      ) : null}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { profile } = await requireUser();
  const isAdmin = profile?.role === "admin";
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const [structure, resources] = await Promise.all([
    isAdmin ? searchAllStructure(query) : searchPublishedStructure(query),
    isAdmin ? searchAllResources(query) : searchPublishedResources(query),
  ]);

  const hasResults =
    structure.courses.length + structure.subjects.length + structure.chapters.length + resources.length > 0;

  const courseHref = (id: string, slug: string) => (isAdmin ? `/admin?course=${id}` : `/courses/${slug}`);

  return (
    <PageShell
      eyebrow="Search"
      title="Search resources"
      description={
        isAdmin
          ? "Search all your content — including drafts — by course, subject, chapter, or resource."
          : "Search courses, subjects, chapters, and resources by name."
      }
      role={profile?.role ?? "student"}
    >
      <form className="flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search notes, files, or topics"
          className="min-h-12 flex-1 rounded-2xl border border-line bg-paper-soft px-4 text-ink outline-none transition placeholder:text-muted focus:border-sage focus-visible:ring-2 focus-visible:ring-sage"
        />
        <button type="submit" className="rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Search
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {query.trim().length < 2 ? (
          <EmptyState title="Start with a search term" description="Type at least two characters to search." />
        ) : !hasResults ? (
          <EmptyState title="No matching results" description="Try a different course, subject, chapter, or resource name." />
        ) : (
          <>
            {structure.courses.length > 0 ? (
              <Section title="Courses">
                {structure.courses.map((c) => (
                  <ResultRow key={c.id} href={courseHref(c.id, c.slug)} title={c.title} draft={!c.is_published} />
                ))}
              </Section>
            ) : null}

            {structure.subjects.length > 0 ? (
              <Section title="Subjects">
                {structure.subjects.map((s) => (
                  <ResultRow
                    key={s.id}
                    href={isAdmin ? `/admin?subject=${s.id}` : `/courses/${s.course.slug}/${s.slug}`}
                    title={s.title}
                    trail={s.course.title}
                    draft={!s.is_published}
                  />
                ))}
              </Section>
            ) : null}

            {structure.chapters.length > 0 ? (
              <Section title="Chapters">
                {structure.chapters.map((c) => (
                  <ResultRow
                    key={c.id}
                    href={isAdmin ? `/admin?chapter=${c.id}` : `/courses/${c.course.slug}/${c.subject.slug}/${c.slug}`}
                    title={c.title}
                    trail={`${c.course.title} / ${c.subject.title}`}
                    draft={!c.is_published}
                  />
                ))}
              </Section>
            ) : null}

            {resources.length > 0 ? (
              <Section title="Resources">
                {resources.map((resource) => (
                  <div key={resource.id} className="space-y-3">
                    {resource.course && resource.subject && resource.chapter ? (
                      <Link
                        href={
                          isAdmin
                            ? `/admin?chapter=${resource.chapter.id}`
                            : `/courses/${resource.course.slug}/${resource.subject.slug}/${resource.chapter.slug}`
                        }
                        className="block text-sm text-muted hover:text-gold"
                      >
                        {resource.course.title} / {resource.subject.title} / {resource.chapter.title}
                      </Link>
                    ) : null}
                    <ResourceCard resource={resource} />
                  </div>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  );
}
