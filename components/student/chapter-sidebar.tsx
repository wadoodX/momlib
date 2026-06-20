"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

type SidebarChapter = {
  id: string;
  slug: string;
  title: string;
};

type ChapterSidebarProps = {
  chapters: SidebarChapter[];
  /** e.g. "/courses/aqidah/tawhid" — chapter href is `${basePath}/${slug}`. */
  basePath: string;
};

function ChapterList({
  chapters,
  basePath,
  activeSlug,
}: ChapterSidebarProps & { activeSlug: string }) {
  return (
    <ol className="space-y-1">
      {chapters.map((chapter, i) => {
        const active = chapter.slug === activeSlug;

        return (
          <li key={chapter.id}>
            <Link
              href={`${basePath}/${chapter.slug}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                active
                  ? "border-sage bg-sage/10 text-ink"
                  : "border-transparent text-muted hover:border-line hover:bg-card hover:text-ink",
              )}
            >
              <span className={cn("mt-0.5 text-xs font-semibold tabular-nums", active ? "text-gold" : "text-muted")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium leading-snug">{chapter.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Udemy-style chapter rail for a subject. Persists across chapter navigations
 * (it lives in the subject layout, not the page), so switching chapters only
 * swaps the content pane — cross-faded by next-view-transitions' Link. The
 * active chapter is derived from the URL via usePathname. On phones it collapses
 * into a <details> "Chapters" disclosure above the content.
 */
export function ChapterSidebar({ chapters, basePath }: ChapterSidebarProps) {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length + 1).split("/")[0]
    : "";

  return (
    <>
      {/* Phones: collapsible disclosure above the content. */}
      <details className="mb-6 rounded-2xl border border-line bg-card lg:hidden">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink">
          Chapters ({chapters.length})
        </summary>
        <div className="px-2 pb-2">
          <ChapterList chapters={chapters} basePath={basePath} activeSlug={activeSlug} />
        </div>
      </details>

      {/* Desktop: sticky left rail. */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-10">
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Chapters</p>
          <ChapterList chapters={chapters} basePath={basePath} activeSlug={activeSlug} />
        </div>
      </aside>
    </>
  );
}
