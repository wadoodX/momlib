import { Link } from "next-view-transitions";
import { BookOpen, Layers, FileText, Search, ArrowRight } from "lucide-react";
import { getRecentlyViewedChapters, getStudentStats } from "@/lib/db/content";
import { timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/student/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { NodeIcon } from "@/components/customization/node-icon";
import { Reveal } from "@/components/landing/reveal";

export async function StudentDashboard() {
  const [stats, recent] = await Promise.all([getStudentStats(), getRecentlyViewedChapters()]);

  return (
    <div className="space-y-10">
      <Reveal>
        <form action="/courses" method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Search notes, files, or topics"
              className="min-h-12 w-full rounded-2xl border border-line bg-paper-soft pl-12 pr-4 text-ink outline-none transition placeholder:text-muted focus:border-sage"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-paper transition hover:bg-sage-deep"
          >
            Search
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Courses available" value={stats.courses} icon={BookOpen} />
          <StatCard label="Chapters" value={stats.chapters} icon={Layers} />
          <StatCard label="Resources" value={stats.resources} icon={FileText} />
        </div>
      </Reveal>

      {stats.chapters > 0 ? (
        <Reveal delay={0.1}>
          <ProgressCard viewed={stats.viewedChapters} total={stats.chapters} />
        </Reveal>
      ) : null}

      <Reveal delay={0.15}>
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Continue learning</h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-gold"
            >
              Browse all courses
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4">
            {recent.length === 0 ? (
              <EmptyState
                title="Nothing yet"
                description="Chapters you open will show up here so you can pick up where you left off."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recent.map((chapter) => (
                  <Link
                    key={chapter.chapterId}
                    href={chapter.href}
                    className="group flex items-start gap-4 rounded-3xl border border-line bg-card p-5 transition hover:border-sage"
                  >
                    <NodeIcon icon={chapter.icon} color={chapter.color} kind="subject" size="md" className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="truncate text-xs uppercase tracking-[0.2em] text-muted">{chapter.trail}</p>
                      <h3 className="mt-1 truncate text-lg font-semibold text-ink">{chapter.title}</h3>
                      <p className="mt-1 text-xs text-muted">Viewed {timeAgo(chapter.viewedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
