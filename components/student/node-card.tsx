import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import { NodeIcon } from "@/components/customization/node-icon";
import { colorHex } from "@/lib/customization";
import { cleanNodeDescription } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "Illuminated" card for a course/subject. Server-safe (no hooks, like NodeIcon).
 * Reads the node's curated color/icon and shows a tidy description line (the
 * module-status/"Core text" labels are stripped — see cleanNodeDescription).
 * Degrades cleanly when color/icon/description are unset (courses have no
 * description; a few subjects are blank). `index` drives the staggered entrance;
 * `meta` is an optional muted line (e.g. "13 subjects").
 */
export function NodeCard({
  href,
  title,
  description,
  icon,
  color,
  kind,
  meta,
  index = 0,
  className,
}: {
  href: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  kind: "course" | "subject";
  meta?: string | null;
  index?: number;
  className?: string;
}) {
  const hex = colorHex(color);
  const cleaned = cleanNodeDescription(description);
  const hasMeta = Boolean(cleaned || meta);

  return (
    <Link
      href={href}
      style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
      className={cn(
        "card-rise group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-card",
        "transition duration-300 hover:-translate-y-1 hover:border-sage hover:shadow-[0_18px_40px_-24px_rgba(22,52,46,0.45)]",
        className,
      )}
    >
      {/* Color-wash header band — low-alpha hex over bg-card, reads in light + dark. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{ background: `linear-gradient(180deg, ${hex}26, transparent)` }}
      />

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <NodeIcon icon={icon} color={color} kind={kind} size="lg" />
        </div>

        <h2 className="mt-4 line-clamp-2 font-display text-xl font-semibold leading-snug text-ink">{title}</h2>

        {hasMeta ? <span aria-hidden className="mt-3 block h-px w-10 bg-gold/60" /> : null}

        {cleaned ? <p className="mt-3 text-sm leading-6 text-muted">{cleaned}</p> : null}

        {meta ? <p className="mt-2 text-sm font-medium text-muted">{meta}</p> : null}

        <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium text-sage">
          View
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
