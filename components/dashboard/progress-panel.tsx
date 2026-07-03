import { Link } from "next-view-transitions";
import type { OverallProgress, SubjectProgress } from "@/lib/dashboard";

// Bar with a token track + sage fill (reads in light and dark).
function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-sage" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressPanel({ overall, subjects }: { overall: OverallProgress; subjects: SubjectProgress[] }) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Your progress</p>
        <span className="text-sm font-semibold text-gold">{overall.pct}% overall</span>
      </div>

      {subjects.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Mark a chapter complete and your progress fills in here — per subject and overall.
        </p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {subjects.map((s) => (
            <li key={s.subjectId}>
              <Link href={s.href} className="group block">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink group-hover:text-sage">{s.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {s.completed} / {s.total}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Bar pct={s.pct} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
