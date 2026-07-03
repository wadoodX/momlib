import Link from "next/link";

const STATS = [
  { value: "8", label: "sciences" },
  { value: "1,200+", label: "students, free" },
  { value: "3,500+", label: "resources" },
];

export function Hero() {
  return (
    <section className="mx-4 mt-3 overflow-hidden rounded-[24px] bg-[var(--l-teal)] sm:mx-6">
      <div className="grid lg:grid-cols-2 lg:min-h-[660px]">
        {/* Left: text on deep teal */}
        <div
          className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-[72px] lg:py-20"
          style={{ background: "linear-gradient(180deg,#173F36 0%,#153A31 100%)" }}
        >
          <div className="flex items-center gap-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--l-gold-3)]">
              Nibras
            </span>
            <div className="h-px w-14" style={{ background: "rgba(227,198,126,0.5)" }} />
            <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--l-on-teal-2)]">
              Est. for the Alimiyyah
            </span>
          </div>

          <h1 className="l-serif mt-8 text-[clamp(2.6rem,6.4vw,82px)] font-medium leading-[1.02] tracking-[-0.01em] text-[var(--l-cream)]">
            The whole
            <br />
            course of study,
            <br />
            <span className="text-[var(--l-gold-3)]">gathered.</span>
          </h1>

          <p className="mt-7 max-w-[460px] text-[17px] leading-[1.7] text-[var(--l-on-teal)] sm:text-lg">
            Every note, slide, recording, and quiz your teacher publishes — kept in one calm
            library, searchable in seconds and open on any device.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/courses"
              className="btn-gold inline-flex rounded-[10px] bg-[var(--l-gold-3)] px-[34px] py-4 text-[15px] font-bold text-[#1c2b1e]"
            >
              Explore the library
            </Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--l-cream)] transition-opacity hover:opacity-80"
            >
              Start free <span className="text-[var(--l-gold-3)]">→</span>
            </Link>
          </div>

          <div className="mt-11 flex items-center gap-6 sm:gap-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 sm:gap-8">
                {i > 0 && (
                  <div
                    className="h-[34px] w-px"
                    style={{ background: "rgba(247,250,242,0.14)" }}
                    aria-hidden
                  />
                )}
                <div>
                  <div className="l-serif text-[32px] font-medium leading-none text-[var(--l-cream)]">
                    {s.value}
                  </div>
                  <div className="mt-1.5 text-[11.5px] tracking-[0.04em] text-[var(--l-on-teal-2)]">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: full-bleed image with title plate. Drop a calm landscape at
            public/hero-landscape.jpg to replace the designed fallback gradient. */}
        <div
          className="relative min-h-[340px] lg:min-h-0"
          style={{
            background:
              "linear-gradient(105deg,#153A31 0%,rgba(21,58,49,0.55) 22%,rgba(21,58,49,0) 52%)," +
              "linear-gradient(to top,rgba(9,26,21,0.55) 0%,transparent 42%)," +
              "url('/hero-landscape.jpg') center/cover no-repeat," +
              "linear-gradient(160deg,#2f6f5c 0%,#184035 52%,#b8903e 150%)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-end justify-between gap-5 sm:inset-x-9 sm:bottom-9">
            <p
              className="l-serif m-0 max-w-[320px] text-[20px] italic leading-[1.45] text-[var(--l-cream-2)] sm:text-[22px]"
              style={{ textShadow: "0 2px 12px rgba(9,26,21,0.5)" }}
            >
              “A lamp for the seeker — book by book, chapter by chapter.”
            </p>
            <span
              className="hidden flex-none text-[11px] uppercase tracking-[0.22em] text-[rgba(247,250,242,0.75)] sm:block"
              style={{ textShadow: "0 2px 8px rgba(9,26,21,0.5)" }}
            >
              Free for students · Pro $5/mo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
