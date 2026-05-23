import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {Icon ? (
          <span className="flex size-9 items-center justify-center rounded-full bg-sage/10 text-sage">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
