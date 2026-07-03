import type { DayPoint } from "@/lib/admin/insights";

// Server-rendered 14-day activity column chart for the engagement panel.
// Pure inline SVG — no chart library, no client JS. Single series (mint) with
// the last bar (today) emphasized in the panel gold; position is the primary
// "today" encoding, hue reinforces it. Native <title> per bar supplies values.

const W = 280;
const H = 72;
const BASELINE = H - 1;
const PLOT_H = 58; // headroom above the tallest bar
const STUB_H = 2; // zero-day stub keeps the daily rhythm legible

function prettyDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function ViewsBarChart({ days }: { days: DayPoint[] }) {
  const n = days.length;
  if (n === 0) return null;

  const total = days.reduce((sum, d) => sum + d.views, 0);
  const peak = days.reduce((a, b) => (b.views > a.views ? b : a), days[0]);
  // Scale ceiling of 5 so one open among a handful of students doesn't render
  // as a full-height tower (honest at today's scale).
  const ceiling = Math.max(peak.views, 5);

  const gap = 6;
  const barW = (W - gap * (n - 1)) / n;

  const label =
    total === 0
      ? `No chapter opens in the last ${n} days`
      : `Chapter opens over the last ${n} days: ${total} total, peak of ${peak.views} on ${prettyDay(peak.day)}`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        {days.map((d, i) => {
          const isToday = i === n - 1;
          const h = d.views === 0 ? STUB_H : STUB_H + (d.views / ceiling) * (PLOT_H - STUB_H);
          return (
            <rect
              key={d.day}
              x={i * (barW + gap)}
              y={BASELINE - h}
              width={barW}
              height={h}
              rx={2}
              className={isToday ? "fill-panel-gold" : "fill-panel-accent"}
              opacity={d.views === 0 ? 0.35 : 1}
            >
              <title>{`${prettyDay(d.day)}: ${d.views} ${d.views === 1 ? "open" : "opens"}`}</title>
            </rect>
          );
        })}
        <line x1={0} y1={BASELINE + 0.5} x2={W} y2={BASELINE + 0.5} className="stroke-panel-line" strokeWidth={1} />
      </svg>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-panel-muted">
        <span>{prettyDay(days[0].day)}</span>
        <span>Today</span>
      </div>
      {total === 0 ? (
        <p className="mt-3 text-sm leading-6 text-panel-muted">
          No opens yet this fortnight — share a course link with your learners to light this up.
        </p>
      ) : null}
    </div>
  );
}
