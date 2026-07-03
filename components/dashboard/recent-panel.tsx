import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import { NodeIcon } from "@/components/customization/node-icon";
import { timeAgo } from "@/lib/format";
import type { ChapterRef, RecentChapter } from "@/lib/dashboard";

// Recently-viewed chapters once the student has activity; otherwise a plain
// "Start here" list of first chapters (no icons, by request).
export function RecentPanel({
  recent,
  startHere,
  hasActivity,
}: {
  recent: RecentChapter[];
  startHere: ChapterRef[];
  hasActivity: boolean;
}) {
  if (hasActivity) {
    return (
      <section className="flex h-full flex-col rounded-3xl border border-line bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Recently viewed</p>
        <ul className="mt-4 space-y-2.5">
          {recent.map((item) => (
            <li key={item.chapterId}>
              <Link href={item.href} className="group flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-paper-soft">
                <NodeIcon icon={item.icon} color={item.color} kind="subject" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink group-hover:text-sage">{item.title}</p>
                  <p className="truncate text-xs text-muted">
                    {item.trail} · {timeAgo(item.viewedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (startHere.length === 0) return null;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Start here</p>
      <ul className="mt-4 space-y-1">
        {startHere.map((item) => (
          <li key={item.chapterId}>
            <Link
              href={item.href}
              className="group flex items-center justify-between gap-3 rounded-2xl px-2 py-2 transition hover:bg-paper-soft"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink group-hover:text-sage">{item.title}</p>
                <p className="truncate text-xs text-muted">{item.trail}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:text-sage" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
