import { Reveal } from "./reveal";

/*
 * SAMPLE CONTENT — placeholders so the section looks complete during development.
 * Replace these with real quotes, names, institutions, and numbers before the
 * site goes public (tracked in TODO.md).
 */
const TESTIMONIALS = [
  {
    quote:
      "Nibras replaced the tangle of WhatsApp groups and Drive links we used to share notes. Everything I publish now lives in one place my students actually find.",
    name: "Ustadh Bilal Ahmed",
    role: "Teacher · Al-Falah Institute",
  },
  {
    quote:
      "I used to lose handouts constantly. Now I just search and the right chapter is there in seconds — and I pick up exactly where I left off.",
    name: "Maryam Yusuf",
    role: "Alimiyyah student",
  },
  {
    quote:
      "Setting up our whole curriculum took an afternoon. Students only see what we've published, and the search saves everyone hours every week.",
    name: "Dr. Sumayyah Khan",
    role: "Academic Coordinator",
  },
];

const STATS = [
  { value: "1,200+", label: "students learning" },
  { value: "60+", label: "courses published" },
  { value: "3,500+", label: "resources shared" },
];

export function Testimonials() {
  return (
    <section className="px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Loved by learners and teachers</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            Trusted to hold what matters.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-card p-8">
                <span aria-hidden className="font-display text-4xl leading-none text-gold/60">&ldquo;</span>
                <blockquote className="mt-3 flex-1 text-base leading-7 text-ink">{t.quote}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14">
          <dl className="grid gap-6 rounded-3xl border border-line bg-card px-6 py-10 text-center sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-4xl font-semibold text-ink sm:text-5xl">{s.value}</dt>
                <dd className="mt-2 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
