import { Link } from "next-view-transitions";
import { NodeIcon } from "@/components/customization/node-icon";
import type { NewChapter } from "@/lib/dashboard";

// "Discover · newly added" — the most recently created chapters.
export function DiscoverPanel({ items }: { items: NewChapter[] }) {
  if (items.length === 0) return null;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Discover · newly added</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.chapterId}>
            <Link href={item.href} className="group flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-paper-soft">
              <NodeIcon icon={item.icon} color={item.color} kind="subject" size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink group-hover:text-sage">{item.title}</p>
                <p className="truncate text-xs text-muted">{item.trail}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
