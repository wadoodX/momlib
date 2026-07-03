import { timeAgo } from "@/lib/format";
import type { ActivitySummary } from "@/lib/dashboard";

// Light activity signal derived from chapter_views (approximate by design).
export function ActivityCard({ activity }: { activity: ActivitySummary }) {
  const { activeDaysLast7, days, lastViewedAt } = activity;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Activity</p>

      {lastViewedAt ? (
        <>
          <p className="font-display mt-2 text-xl font-semibold text-ink">
            Active {activeDaysLast7} of last 7 days
          </p>
          <div className="mt-4 flex items-center gap-1.5" aria-hidden>
            {days.map((on, i) => (
              <span key={i} className={`h-7 flex-1 rounded-md ${on ? "bg-sage" : "bg-line"}`} />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">Last 7 days</p>
          <p className="mt-auto pt-4 text-xs text-muted">Last opened {timeAgo(lastViewedAt)}</p>
        </>
      ) : (
        <>
          <p className="font-display mt-2 text-xl font-semibold text-ink">No activity yet</p>
          <p className="mt-2 text-sm leading-6 text-muted">Open a chapter to get started — your active days show up here.</p>
        </>
      )}
    </section>
  );
}
