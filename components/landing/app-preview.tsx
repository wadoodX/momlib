import { BookOpen, ScrollText, Compass, Languages } from "lucide-react";
import { Reveal } from "./reveal";

// A stylized preview of the real library UI (mirrors the NodeCard look), so a
// first-time visitor instantly sees what the product is.
const SAMPLE = [
  { icon: BookOpen, color: "#7c9468", title: "Qurʾānic Studies", meta: "13 subjects" },
  { icon: ScrollText, color: "#bf9f53", title: "Ḥadīth Studies", meta: "16 subjects" },
  { icon: Compass, color: "#4f86b0", title: "Fiqh & Fatāwā", meta: "20 subjects" },
  { icon: Languages, color: "#4f9e96", title: "Arabic Language", meta: "34 subjects" },
];

export function AppPreview() {
  return (
    <section id="what" className="scroll-mt-20 px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">What is Nibras</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            One calm library for an entire course of study.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Courses, subjects, chapters, and resources — nested neatly and searchable in seconds.
            This is exactly what your students see when they sign in.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-ink/10">
            {/* faux browser chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-paper-soft px-4 py-3">
              <span className="size-3 rounded-full bg-[#c0705a]" />
              <span className="size-3 rounded-full bg-[#d4a93f]" />
              <span className="size-3 rounded-full bg-[#7c9468]" />
              <div className="ml-3 flex-1 truncate rounded-md bg-paper px-3 py-1 text-xs text-muted">
                nibras.app / courses
              </div>
            </div>
            {/* mini course-card grid */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE.map((c) => (
                <div
                  key={c.title}
                  className="relative overflow-hidden rounded-2xl border border-line bg-card p-5"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-16"
                    style={{ background: `linear-gradient(180deg, ${c.color}26, transparent)` }}
                  />
                  <span
                    className="relative flex size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${c.color}26`, color: c.color }}
                  >
                    <c.icon className="size-5" />
                  </span>
                  <h3 className="font-display relative mt-4 text-base font-semibold text-ink">{c.title}</h3>
                  <p className="relative mt-1 text-xs text-muted">{c.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
