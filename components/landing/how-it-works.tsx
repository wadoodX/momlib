// Three-card "pipeline": one teacher publishes → Nibras keeps the order →
// everyone studies (read-only). Faithful translation of the design mockup.

function ResourceRow({
  tag,
  tagBg,
  tagColor,
  label,
}: {
  tag: string;
  tagBg: string;
  tagColor: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-bold"
        style={{ background: tagBg, color: tagColor }}
      >
        {tag}
      </span>
      <span className="text-xs text-[var(--l-ink)]">{label}</span>
      <span className="ml-auto text-xs font-bold text-[var(--l-btn)]">↑</span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how"
      className="scroll-mt-20 border-y border-[var(--l-line)] bg-[var(--l-card-2)] px-5 py-24 sm:px-10 lg:px-14 lg:py-[100px]"
    >
      {/* header */}
      <div className="flex flex-col items-center text-center">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.32em] text-[var(--l-gold)]">
          How it works
        </span>
        <h2 className="l-serif mt-3.5 max-w-[640px] text-[clamp(1.9rem,4.6vw,50px)] font-medium leading-[1.08] text-[var(--l-ink)]">
          One hand publishes. Everyone learns.
        </h2>
        <p className="mt-3.5 max-w-[520px] text-[15.5px] leading-[1.7] text-[var(--l-ink-2)]">
          Every resource in Nibras is uploaded and arranged by one teacher — so the whole library
          keeps one standard, one order.
        </p>
      </div>

      {/* pipeline */}
      <div className="relative mt-16">
        {/* connecting line (desktop) */}
        <div
          className="absolute left-[16%] right-[16%] top-1/2 hidden h-0.5 md:block"
          style={{
            background:
              "linear-gradient(to right,rgba(199,163,79,0.15),rgba(199,163,79,0.75),rgba(199,163,79,0.15))",
          }}
          aria-hidden
        />

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* 01 — publish */}
          <div
            className="lift rounded-[20px] border border-[var(--l-line)] bg-[var(--l-card)] px-8 py-[34px]"
            style={{ boxShadow: "0 10px 30px rgba(22,52,46,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <span className="l-serif text-[34px] text-[var(--l-gold)]">01</span>
              <span className="rounded bg-[var(--l-btn)] px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--l-card)]">
                Sole publisher
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2 rounded-xl border-[1.5px] border-dashed border-[#b9cfc0] bg-[var(--l-bg)] p-4">
              <ResourceRow tag="PDF" tagBg="#1F5C4D" tagColor="#F7FAF4" label="Lesson notes — Week 10" />
              <ResourceRow tag="REC" tagBg="#E3C67E" tagColor="#16342E" label="Class recording" />
              <ResourceRow tag="QUIZ" tagBg="#BDD2C6" tagColor="#16342E" label="Self-check — ch. 3" />
            </div>
            <div className="l-serif mt-5 text-[25px] font-semibold text-[var(--l-ink)]">
              Your teacher publishes
            </div>
            <p className="mt-2 text-sm leading-[1.65] text-[var(--l-ink-2)]">
              Every note, slide, and recording is uploaded and arranged by Ustadha Yasmeen — one
              hand, one standard.
            </p>
          </div>

          {/* 02 — the library (featured, dark) */}
          <div
            className="lift lift--dark rounded-[20px] border px-8 py-[34px] text-[var(--l-cream-2)]"
            style={{
              background: "linear-gradient(165deg,#1E5245 0%,#16382F 80%)",
              borderColor: "rgba(199,163,79,0.4)",
              boxShadow: "0 18px 44px rgba(22,52,46,0.22)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="l-serif text-[34px] text-[var(--l-gold-3)]">02</span>
              <span className="rounded bg-[var(--l-gold-3)] px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--l-ink)]">
                The library
              </span>
            </div>
            <div
              className="mt-4 flex flex-col gap-1.5 rounded-xl border p-4 text-xs"
              style={{ background: "rgba(9,26,21,0.4)", borderColor: "rgba(247,250,242,0.16)" }}
            >
              <div className="flex items-center gap-2 font-semibold text-[var(--l-cream)]">
                <span className="h-[7px] w-[7px] rotate-45 bg-[var(--l-gold-3)]" />
                Hadith Studies
              </div>
              <div className="ml-4 flex items-center gap-2 text-[var(--l-on-teal)]">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#8FCDB6]" />
                Book of Purification
              </div>
              <div className="ml-8 flex items-center gap-2 text-[var(--l-on-teal)]">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#8FCDB6]" />
                Chapter 3 · Wudu
              </div>
              <div
                className="ml-12 w-fit rounded-md px-2 py-1.5 text-[var(--l-cream)]"
                style={{ background: "rgba(247,250,242,0.1)" }}
              >
                Lesson notes.pdf
              </div>
            </div>
            <div className="l-serif mt-5 text-[25px] font-semibold text-[var(--l-cream)]">
              Nibras keeps the order
            </div>
            <p className="mt-2 text-sm leading-[1.65] text-[var(--l-on-teal)]">
              Courses, chapters, and resources nest neatly — searchable in seconds, impossible to
              scatter.
            </p>
          </div>

          {/* 03 — everyone studies (read only) */}
          <div
            className="lift rounded-[20px] border border-[var(--l-line)] bg-[var(--l-card)] px-8 py-[34px]"
            style={{ boxShadow: "0 10px 30px rgba(22,52,46,0.08)" }}
          >
            <div className="flex items-center justify-between">
              <span className="l-serif text-[34px] text-[var(--l-gold)]">03</span>
              <span className="rounded border border-[#cbdcd3] bg-[var(--l-card-2)] px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--l-ink-2)]">
                Read only
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-[var(--l-line)] bg-[var(--l-bg)] p-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--l-btn)] text-[10.5px] font-bold text-[var(--l-card)]">
                  M
                </span>
                <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-[var(--l-line)]">
                  <div className="h-full w-[72%] bg-[var(--l-btn)]" />
                </div>
                <span className="text-[10.5px] text-[var(--l-ink-2)]">student</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#8FCDB6] text-[10.5px] font-bold text-[var(--l-ink)]">
                  A
                </span>
                <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-[var(--l-line)]">
                  <div className="h-full w-[44%] bg-[var(--l-btn)]" />
                </div>
                <span className="text-[10.5px] text-[var(--l-ink-2)]">student</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--l-gold-2)] text-[10.5px] font-bold text-[var(--l-ink)]">
                  U
                </span>
                <div className="flex flex-1 items-center">
                  <span className="rounded-[3px] border border-[var(--l-gold-2)] px-[7px] py-0.5 text-[10px] font-bold tracking-[0.1em] text-[var(--l-gold)]">
                    VIEW ONLY
                  </span>
                </div>
                <span className="text-[10.5px] text-[var(--l-ink-2)]">colleague</span>
              </div>
            </div>
            <div className="l-serif mt-5 text-[25px] font-semibold text-[var(--l-ink)]">
              Everyone studies
            </div>
            <p className="mt-2 text-sm leading-[1.65] text-[var(--l-ink-2)]">
              Students learn at their own pace and resume where they stopped. Fellow teachers can
              view everything — and change nothing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
