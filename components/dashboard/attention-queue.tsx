import { Link } from "next-view-transitions";
import { AlertTriangle, ArrowRight, CircleDashed, FolderTree, PenLine, Sparkles, type LucideIcon } from "lucide-react";
import type { ContentGap, GapKind } from "@/lib/admin/insights";
import { PublishInlineButton } from "./publish-inline-button";

const MAX_ROWS = 5;

// Severity chips encode the actual failure mode, worst first (queue is
// pre-sorted by lib/admin/insights.ts).
const GAP_META: Record<GapKind, { icon: LucideIcon; chip: string; reason: string }> = {
  "blocked-publish": {
    icon: AlertTriangle,
    chip: "bg-destructive/10 text-destructive",
    reason: "Published content is hidden behind this draft — publish it to unblock",
  },
  "empty-chapter": {
    icon: CircleDashed,
    chip: "bg-gold/15 text-gold",
    reason: "Published chapter with no resources yet",
  },
  "childless-subject": {
    icon: FolderTree,
    chip: "bg-sage/10 text-sage",
    reason: "No chapters yet",
  },
  "draft-course": {
    icon: PenLine,
    chip: "bg-sage/10 text-sage",
    reason: "Draft — invisible to students",
  },
};

export function AttentionQueue({ gaps }: { gaps: ContentGap[] }) {
  const shown = gaps.slice(0, MAX_ROWS);
  const overflow = gaps.length - shown.length;

  return (
    <section className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">Needs attention</p>
          <h2 className="font-display mt-2 text-xl font-semibold text-ink">
            {gaps.length === 0 ? "Nothing waiting on you" : `${gaps.length} ${gaps.length === 1 ? "item" : "items"} to tend`}
          </h2>
        </div>
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-gold"
        >
          Open studio <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {gaps.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-paper-soft px-6 py-10 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <p className="font-display text-lg font-semibold text-ink">All clear, mashallah.</p>
          <p className="max-w-xs text-sm leading-6 text-muted">
            Every published chapter has content and nothing is stuck behind a draft.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {shown.map((gap) => {
            const meta = GAP_META[gap.kind];
            const Icon = meta.icon;
            return (
              <li
                key={`${gap.kind}-${gap.id}`}
                className="lift-soft flex items-center gap-4 rounded-2xl border border-line bg-paper p-4"
              >
                <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
                  <Icon className="size-4" aria-hidden />
                </span>
                {/* The text block is the link; the publish button stays a sibling. */}
                <Link href={gap.href} className="group min-w-0 flex-1">
                  {gap.trail ? (
                    <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted">{gap.trail}</p>
                  ) : null}
                  <p className="truncate font-semibold text-ink group-hover:text-gold">{gap.title}</p>
                  <p className="truncate text-xs text-muted">{meta.reason}</p>
                </Link>
                {gap.action === "publish" ? <PublishInlineButton kind={gap.nodeKind} id={gap.id} /> : null}
              </li>
            );
          })}
        </ul>
      )}

      {overflow > 0 ? (
        <p className="mt-3 text-xs text-muted">
          + {overflow} more —{" "}
          <Link href="/admin" className="font-medium text-gold hover:underline">
            see everything in the studio
          </Link>
        </p>
      ) : null}
    </section>
  );
}
