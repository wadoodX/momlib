type ProgressCardProps = {
  viewed: number;
  total: number;
};

export function ProgressCard({ viewed, total }: ProgressCardProps) {
  const pct = total > 0 ? Math.min(100, Math.round((viewed / total) * 100)) : 0;

  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Your progress</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            You&apos;ve explored {viewed} of {total} {total === 1 ? "chapter" : "chapters"}
          </p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-gold">{pct}%</p>
      </div>
      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-paper-soft"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-sage transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
