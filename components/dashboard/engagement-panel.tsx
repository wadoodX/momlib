import { Link } from "next-view-transitions";
import type { EngagementSummary, TopViewedChapter } from "@/lib/db/admin-content";
import type { DayPoint } from "@/lib/admin/insights";
import { timeAgo } from "@/lib/format";
import { ViewsBarChart } from "./views-bar-chart";

// The dashboard's featured cell: a deep-teal panel (dark in BOTH themes — all
// text/lines on it use the panel-* tokens, never ink/muted, which flip).
export function EngagementPanel({
  summary,
  days,
  topChapters,
}: {
  summary: EngagementSummary;
  days: DayPoint[];
  topChapters: TopViewedChapter[];
}) {
  const stats = [
    { label: "Chapter opens", value: summary.totalViews },
    { label: "Learners", value: summary.learners },
    { label: "This week", value: summary.views7d },
  ];

  return (
    <section className="panel-deep relative overflow-hidden rounded-3xl p-6 text-panel-ink sm:p-8">
      {/* soft gold glow, echoing the landing's featured card */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-panel-gold) 22%, transparent), transparent 70%)" }}
        aria-hidden
      />

      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-panel-gold">Engagement</p>
      <h2 className="font-display mt-2 text-2xl font-semibold leading-snug">How the library is being read</h2>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-3xl font-semibold leading-none">{s.value}</dd>
            <dt className="mt-1 text-xs text-panel-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-panel-muted">Activity, last 14 days</p>
        <ViewsBarChart days={days} />
      </div>

      <div className="mt-6 border-t border-panel-line pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-panel-muted">Most read</h3>
        {topChapters.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-panel-muted">
            Your most-read chapters will gather here once students start opening the library.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {topChapters.map((chapter, i) => (
              <li key={chapter.chapterId}>
                <Link
                  href={chapter.href}
                  className="group flex items-center gap-3.5 rounded-xl border border-transparent p-2.5 transition-colors hover:border-panel-line"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-panel-gold/15 font-display text-sm font-semibold text-panel-gold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-panel-ink group-hover:text-panel-gold">
                      {chapter.title}
                    </span>
                    <span className="block truncate text-[11px] uppercase tracking-[0.16em] text-panel-muted">
                      {chapter.trail}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-panel-ink">{chapter.viewCount}</span>
                    <span className="block text-[11px] text-panel-muted">
                      {chapter.learnerCount} {chapter.learnerCount === 1 ? "learner" : "learners"} · {timeAgo(chapter.lastViewedAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
