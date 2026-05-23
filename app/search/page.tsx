import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { searchPublishedResources } from "@/lib/db/content";
import { EmptyState } from "@/components/student/empty-state";
import { PageShell } from "@/components/student/page-shell";
import { ResourceCard } from "@/components/student/resource-card";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireUser();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = await searchPublishedResources(query);

  return (
    <PageShell eyebrow="Search" title="Search resources" description="Search published resources by title, description, or file name.">
      <form className="flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search notes, files, or topics"
          className="min-h-12 flex-1 rounded-2xl border border-stone-700 bg-stone-900 px-4 text-stone-50 outline-none transition placeholder:text-stone-500 focus:border-emerald-300"
        />
        <button type="submit" className="rounded-2xl bg-emerald-300 px-6 py-3 text-sm font-semibold text-stone-950 hover:bg-emerald-200">
          Search
        </button>
      </form>

      <div className="mt-8">
        {query.length === 0 ? (
          <EmptyState title="Start with a search term" description="Type at least two characters to search published resources." />
        ) : results.length === 0 ? (
          <EmptyState title="No matching resources" description="Try a different title, topic, or file name." />
        ) : (
          <div className="space-y-4">
            {results.map((resource) => (
              <div key={resource.id} className="space-y-3">
                {resource.course && resource.subject && resource.chapter ? (
                  <Link
                    href={`/courses/${resource.course.slug}/${resource.subject.slug}/${resource.chapter.slug}`}
                    className="block text-sm text-stone-400 hover:text-emerald-300"
                  >
                    {resource.course.title} / {resource.subject.title} / {resource.chapter.title}
                  </Link>
                ) : null}
                <ResourceCard resource={resource} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
