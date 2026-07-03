import { Link } from "next-view-transitions";
import { ArrowRight } from "lucide-react";
import type { ChapterRef, ResumeInfo } from "@/lib/dashboard";

// The featured deep-teal hero. Shows "Continue where you left off" when the
// student has activity, otherwise "Start here" pointing at the first chapter.
// All text uses panel-* tokens (the panel is dark in both themes).
export function ResumeHero({ resume, startHere }: { resume: ResumeInfo; startHere: ChapterRef[] }) {
  const active = resume.current;
  const start = startHere[0] ?? null;
  const target = active?.href ?? start?.href ?? null;
  if (!target) return null;

  const eyebrow = active ? "Continue where you left off" : "Start here";
  const title = active ? active.title : start!.title;
  const trail = active ? active.trail : start!.trail;
  const cta = active ? "Resume" : "Begin";

  return (
    <section className="panel-deep relative overflow-hidden rounded-3xl p-6 text-panel-ink sm:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-panel-gold) 22%, transparent), transparent 70%)" }}
        aria-hidden
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-panel-gold">{eyebrow}</p>
      <h2 className="font-display mt-2 max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
      <p className="mt-1.5 text-sm text-panel-muted">{trail}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={target}
          className="inline-flex items-center gap-1.5 rounded-full bg-panel-gold px-5 py-2.5 text-sm font-semibold text-[color:var(--panel-to)] transition hover:opacity-90"
        >
          {cta}
          <ArrowRight className="size-4" />
        </Link>
        {active && resume.upNext ? (
          <Link href={resume.upNext.href} className="text-sm text-panel-muted transition hover:text-panel-ink">
            Up next · {resume.upNext.title}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
