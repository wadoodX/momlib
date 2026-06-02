import { GraduationCap, PenLine, Check } from "lucide-react";
import { Reveal } from "./reveal";

const STUDENT = {
  icon: GraduationCap,
  label: "For students",
  title: "Everything your teacher shares, in one place.",
  points: [
    "Browse published courses, chapters, and resources at your own pace",
    "Search every note and file in seconds",
    "Pick up exactly where you left off",
    "Preview PDFs, slides, and video without leaving the page",
  ],
};

const TEACHER = {
  icon: PenLine,
  label: "For teachers",
  title: "A calm home to publish your whole curriculum.",
  points: [
    "Add courses, chapters, and resources in minutes",
    "Organize and reorder with simple drag-and-drop",
    "Control exactly what students see — publish when it's ready",
    "Reach every student from one shared library",
  ],
};

function AudienceCard({ data }: { data: typeof STUDENT }) {
  const Icon = data.icon;
  return (
    <div className="flex h-full flex-col rounded-3xl border border-line bg-card p-8 sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-sage/15 text-sage">
          <Icon className="size-5" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{data.label}</span>
      </div>
      <h3 className="font-display mt-6 text-2xl font-semibold leading-snug text-ink sm:text-3xl">
        {data.title}
      </h3>
      <ul className="mt-7 space-y-4">
        {data.points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm leading-6 text-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-sage" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Audiences() {
  return (
    <section className="px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">For everyone</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            Built for both sides of the desk.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Whether you are learning or teaching, Nibras keeps the entire library in order.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <AudienceCard data={STUDENT} />
          </Reveal>
          <Reveal delay={0.1}>
            <AudienceCard data={TEACHER} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
