import { Reveal } from "./reveal";

const features = [
  {
    title: "A clear hierarchy",
    body: "Courses, subjects, chapters, and resources nest neatly, so every note has a place and nothing gets lost.",
    glyph: "M4 5h16M4 10h16M4 15h10M4 20h7",
  },
  {
    title: "Secure by default",
    body: "Students only ever see what has been published and shared with them. No leaks, no surprises.",
    glyph: "M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z",
  },
  {
    title: "Search that finds it",
    body: "Full text search sweeps across titles, descriptions, and file names, so the right resource is one query away.",
    glyph: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 2l-5.6-5.6",
  },
  {
    title: "Preview anything",
    body: "PDFs, slide decks, documents, images, video, and links open inline. No downloads, no detours.",
    glyph: "M3 5h18v14H3zM3 9h18M8 5v14",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 text-ink">
      <div className="mx-auto w-full max-w-6xl px-6 py-28 sm:py-36">
        <Reveal>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-muted">Features</p>
          <h2 className="font-display mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">
            Built for the long, quiet work of learning.
          </h2>
        </Reveal>

        <div className="mt-16 grid border-t border-line sm:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 0.06}
              className={`border-b border-line py-10 ${index % 2 === 0 ? "sm:border-r sm:pr-10" : "sm:pl-10"}`}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-sage">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.glyph} />
                  </svg>
                </span>
                <span className="font-display text-sm text-gold">0{index + 1}</span>
              </div>
              <h3 className="font-display mt-6 text-2xl font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 max-w-md leading-7 text-muted">{feature.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
