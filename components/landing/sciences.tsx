import Link from "next/link";

type Science = {
  n: string;
  title: string;
  sub: string;
  h: number; // exact arcade height at xl (8-across)
  tall?: boolean; // featured (Quran / Hadith)
  deg: number; // gradient angle
};

// Static marketing showcase of the curriculum. The landing is public, so this
// is hand-written content, not real course data; each arch links to /courses.
const SCIENCES: Science[] = [
  { n: "01", title: "Arabic Grammar", sub: "Structure & case endings", h: 356, deg: 160 },
  { n: "02", title: "Morphology", sub: "The science of sarf", h: 324, deg: 200 },
  { n: "03", title: "Arabic Language", sub: "Toward living command", h: 340, deg: 160 },
  { n: "04", title: "Quran", sub: "Tafsir & the Quranic sciences", h: 388, tall: true, deg: 160 },
  { n: "05", title: "Hadith", sub: "The Prophetic traditions", h: 388, tall: true, deg: 200 },
  { n: "06", title: "Seerah", sub: "The Prophet's life & era", h: 340, deg: 200 },
  { n: "07", title: "Tazkiyah", sub: "Purification of the heart", h: 324, deg: 160 },
  { n: "08", title: "Fiqh", sub: "Jurisprudence & principles", h: 356, deg: 200 },
];

function cardBackground(s: Science) {
  return s.tall
    ? `linear-gradient(${s.deg}deg,#F2F8F2 0%,#DFEEE3 35%,#BFDCCB 70%,#EDDFB6 100%)`
    : `linear-gradient(${s.deg}deg,#F7FAF4 0%,#EAF2EB 40%,#CFE6DA 72%,#F0E7C8 100%)`;
}

export function Sciences() {
  return (
    <section
      id="sciences"
      className="scroll-mt-20 px-5 py-24 sm:px-10 lg:px-14 lg:pb-[100px] lg:pt-[110px]"
    >
      {/* header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5" aria-hidden>
          <div className="h-px w-9 bg-[var(--l-gold-2)]" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[var(--l-gold-2)]" />
          <div className="h-px w-9 bg-[var(--l-gold-2)]" />
        </div>
        <span className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.32em] text-[var(--l-gold)]">
          The curriculum
        </span>
        <h2 className="l-serif mt-3.5 text-[clamp(2rem,5vw,54px)] font-medium leading-[1.05] text-[var(--l-ink)]">
          Eight sciences, eight doorways
        </h2>
        <p className="mt-3.5 max-w-[480px] text-[15.5px] leading-[1.7] text-[var(--l-ink-2)]">
          Each one an arch you can step through — built from foundation to depth, at your own pace.
        </p>
      </div>

      {/* arcade */}
      <div className="mt-16 grid grid-cols-2 items-end gap-3.5 sm:grid-cols-4 xl:grid-cols-8">
        {SCIENCES.map((s) => (
          <Link
            key={s.n}
            href="/courses"
            style={
              {
                background: cardBackground(s),
                borderColor: s.tall ? "var(--l-line-2)" : "var(--l-line)",
                boxShadow: s.tall
                  ? "0 8px 22px rgba(22,52,46,0.1)"
                  : "0 2px 10px rgba(22,52,46,0.05)",
                "--h": `${s.h}px`,
              } as React.CSSProperties
            }
            className={`arch flex flex-col items-center rounded-t-[999px] rounded-b-2xl border px-3.5 pb-6 pt-11 text-center ${
              s.tall ? "arch--tall h-[330px] xl:h-[var(--h)]" : "h-[300px] xl:h-[var(--h)]"
            }`}
          >
            <span
              className={`rotate-45 bg-[var(--l-gold-2)] ${s.tall ? "h-2 w-2" : "h-[7px] w-[7px]"}`}
              aria-hidden
            />
            <div className="mt-auto flex flex-col items-center gap-[7px]">
              <span className="l-serif text-[15px] text-[var(--l-gold)]">{s.n}</span>
              <div
                className={`l-serif font-semibold leading-[1.15] text-[var(--l-ink)] ${
                  s.tall ? "text-[22px]" : "text-[21px]"
                }`}
              >
                {s.title}
              </div>
              <p className="m-0 text-[11.5px] leading-[1.5] text-[var(--l-ink-2)]">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* divider + CTA */}
      <div
        className="mt-[22px] h-px"
        style={{
          background: "linear-gradient(to right,transparent,#C7A34F 20%,#C7A34F 80%,transparent)",
        }}
        aria-hidden
      />
      <div className="mt-9 text-center">
        <Link
          href="/courses"
          className="border-b border-[rgba(168,132,46,0.4)] pb-[3px] text-[14.5px] font-semibold text-[var(--l-gold)] transition-colors hover:border-[var(--l-gold)]"
        >
          Step into the full curriculum →
        </Link>
      </div>
    </section>
  );
}
