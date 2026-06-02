import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Teachers publish",
    body: "Upload notes, slides, and recordings into a clean course → chapter structure. Publish each piece when it is ready.",
  },
  {
    n: "02",
    title: "Students explore",
    body: "Browse, search, and preview everything their teacher shares — on any device, all in one searchable place.",
  },
  {
    n: "03",
    title: "Learning compounds",
    body: "Everyone picks up where they left off. Nothing gets lost in folders, chats, or scattered downloads.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">How it works</p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            From scattered files to a living library.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="relative">
                <span className="font-display text-5xl font-semibold text-gold/70">{step.n}</span>
                <h3 className="font-display mt-4 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
