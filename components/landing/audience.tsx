import { Reveal } from "./reveal";

const points = [
  "Browse published courses, chapters, and resources at your own pace",
  "Pick up exactly where you left off with your continue learning trail",
  "Search every note and file in seconds",
  "Preview PDFs, slides, and video without leaving the page",
];

export function Audience() {
  return (
    <section className="relative bg-paper text-ink">
      <div className="mx-auto w-full max-w-6xl px-6 py-28 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-muted">For you</p>
              <h2 className="font-display mt-5 text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">
                Made for the way you study.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-muted">
                No clutter, no hunting through folders. Everything your teacher shares lands here,
                organized and ready the moment you sign in.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="divide-y divide-line border-y border-line">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-4 py-6 text-lg text-ink">
                  <svg className="mt-1 shrink-0 text-sage" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="leading-8 text-muted">{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
