import { SearchIcon } from "lucide-react";

function SearchResult({
  tag,
  tagBg,
  meta,
  children,
}: {
  tag: string;
  tagBg: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-[10px] border px-4 py-3"
      style={{ background: "rgba(247,250,242,0.08)", borderColor: "rgba(247,250,242,0.14)" }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="rounded px-1.5 py-[3px] text-[10px] font-bold text-[var(--l-ink)]"
          style={{ background: tagBg }}
        >
          {tag}
        </span>
        <span className="text-[13.5px] text-[var(--l-cream-2)]">{children}</span>
      </div>
      <span className="text-[11px] text-[#a9c2b4]">{meta}</span>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-5 py-24 sm:px-10 lg:px-14 lg:py-[100px]">
      {/* header */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-12">
        <div>
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.32em] text-[var(--l-gold)]">
            Features
          </span>
          <h2 className="l-serif mt-3.5 max-w-[560px] text-[clamp(1.9rem,4.6vw,50px)] font-medium leading-[1.08] text-[var(--l-ink)]">
            Built for the long, quiet work of learning.
          </h2>
        </div>
        <p className="max-w-[340px] text-[15px] leading-[1.7] text-[var(--l-ink-2)] md:mb-2">
          Not another folder dump. A library that behaves like software should in 2026.
        </p>
      </div>

      {/* bento */}
      <div className="mt-[52px] grid gap-[18px] lg:grid-cols-[1.35fr_1fr_1fr] lg:grid-rows-2">
        {/* big dark search card */}
        <div
          className="relative overflow-hidden rounded-[22px] p-10 text-[var(--l-cream-2)] lg:row-span-2"
          style={{ background: "linear-gradient(165deg,#1E5245 0%,#16382F 70%)" }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(227,198,126,0.28),transparent 70%)" }}
            aria-hidden
          />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--l-gold-3)]">
            Instant search
          </span>
          <div className="l-serif mt-3.5 text-[32px] font-semibold leading-[1.15]">
            Search the library.
            <br />
            Find the lesson.
          </div>
          <p className="mt-3 text-sm leading-[1.65] text-[var(--l-on-teal)]">
            Full text search sweeps titles, descriptions, and file names across the whole library.
          </p>

          {/* search input mock */}
          <div
            className="mt-[30px] flex items-center gap-3 rounded-xl border px-[18px] py-3.5 backdrop-blur-[6px]"
            style={{ background: "rgba(9,26,21,0.55)", borderColor: "rgba(247,250,242,0.18)" }}
          >
            <SearchIcon className="h-[15px] w-[15px] text-[#8FCDB6]" />
            <span className="text-[14.5px] text-[var(--l-cream-2)]">
              wud
              <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-[var(--l-gold-3)]" />
            </span>
          </div>

          {/* results */}
          <div className="mt-3 flex flex-col gap-2">
            <SearchResult tag="PDF" tagBg="#8FCDB6" meta="0.08s">
              Lesson notes — <strong className="text-[var(--l-gold-3)]">Wud</strong>u &amp; its sunnan
            </SearchResult>
            <SearchResult tag="REC" tagBg="#E3C67E" meta="ch. 3">
              Week 9 — the fiqh of <strong className="text-[var(--l-gold-3)]">wud</strong>u
            </SearchResult>
            <SearchResult tag="QUIZ" tagBg="#BDD2C6" meta="10 Qs">
              Self-check — purification
            </SearchResult>
          </div>
        </div>

        {/* hierarchy */}
        <div
          className="rounded-[22px] border border-[var(--l-line)] bg-[var(--l-card)] px-[30px] py-[34px]"
          style={{ boxShadow: "0 2px 10px rgba(22,52,46,0.05)" }}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--l-gold)]">
            A clear hierarchy
          </span>
          <div className="l-serif mt-3 text-[26px] font-semibold leading-[1.15] text-[var(--l-ink)]">
            Every note has a home.
          </div>
          <div className="mt-[22px] flex flex-col gap-1.5 text-[13px] text-[var(--l-ink-2)]">
            <div className="flex items-center gap-2 font-semibold text-[var(--l-ink)]">
              <span className="h-2 w-2 rounded-sm bg-[var(--l-btn)]" />
              Hadith Studies
            </div>
            <div className="ml-[18px] flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-[#8FCDB6]" />
              Book of Purification
            </div>
            <div className="ml-9 flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-[var(--l-gold-2)]" />
              Chapter 3 · Wudu
            </div>
            <div className="ml-[54px] flex w-fit items-center gap-2 rounded-lg border border-[var(--l-line)] bg-[var(--l-bg)] px-2.5 py-[7px]">
              <span className="rounded-[3px] bg-[var(--l-btn)] px-[5px] py-0.5 text-[10px] font-bold text-[var(--l-card)]">
                PDF
              </span>
              <span className="font-medium text-[var(--l-ink)]">Lesson notes.pdf</span>
            </div>
          </div>
        </div>

        {/* preview */}
        <div
          className="relative overflow-hidden rounded-[22px] border border-[var(--l-line)] bg-[var(--l-card)] px-[30px] py-[34px]"
          style={{ boxShadow: "0 2px 10px rgba(22,52,46,0.05)" }}
        >
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--l-gold)]">
            Preview anything
          </span>
          <div className="l-serif mt-3 text-[26px] font-semibold leading-[1.15] text-[var(--l-ink)]">
            Open inline. No downloads.
          </div>
          <div className="relative mt-[22px] h-[110px]">
            <div className="absolute left-0 top-3.5 flex h-[90px] w-[120px] -rotate-[5deg] items-center justify-center rounded-[10px] border border-[var(--l-line)] bg-[var(--l-bg)] text-[11px] font-bold text-[var(--l-ink-2)]">
              PDF
            </div>
            <div
              className="absolute left-[86px] top-1 flex h-[90px] w-[120px] rotate-[2deg] items-center justify-center rounded-[10px] text-[11px] font-bold text-[var(--l-on-teal)]"
              style={{ background: "#1B4A3F", boxShadow: "0 10px 24px rgba(22,52,46,0.25)" }}
            >
              VIDEO
            </div>
            <div className="absolute left-[176px] top-[18px] flex h-[90px] w-[120px] rotate-[7deg] items-center justify-center rounded-[10px] border border-[var(--l-gold-2)] bg-[var(--l-card)] text-[11px] font-bold text-[var(--l-gold)]">
              SLIDES
            </div>
          </div>
        </div>

        {/* wide: always current + resume */}
        <div
          className="grid gap-8 rounded-[22px] border border-[var(--l-line)] p-9 lg:col-span-2 lg:grid-cols-2 lg:gap-11"
          style={{
            background: "linear-gradient(120deg,#F7FAF4 0%,#EDF3EE 100%)",
            boxShadow: "0 2px 10px rgba(22,52,46,0.05)",
          }}
        >
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--l-gold)]">
              Always current
            </span>
            <div className="l-serif mt-3 text-[26px] font-semibold leading-[1.15] text-[var(--l-ink)]">
              New material, the moment it&#39;s shared.
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 rounded-[9px] border border-[var(--l-line)] bg-[var(--l-card)] px-3 py-2.5">
                <span className="rounded-[3px] bg-[var(--l-btn)] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.08em] text-[var(--l-card)]">
                  NEW
                </span>
                <span className="text-[12.5px] font-medium text-[var(--l-ink)]">
                  Week 10 slides — Seerah
                </span>
                <span className="ml-auto text-[11px] text-[var(--l-ink-2)]">2h ago</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-[9px] border border-[var(--l-line)] bg-[var(--l-card)] px-3 py-2.5">
                <span className="rounded-[3px] bg-[var(--l-gold-3)] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.08em] text-[var(--l-ink)]">
                  QUIZ
                </span>
                <span className="text-[12.5px] font-medium text-[var(--l-ink)]">
                  Revision — Hadith terminology
                </span>
                <span className="ml-auto text-[11px] text-[var(--l-ink-2)]">1d ago</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[var(--l-gold)]">
              Pick up where you left off
            </span>
            <div className="l-serif mt-3 text-[26px] font-semibold leading-[1.15] text-[var(--l-ink)]">
              Your place is kept.
            </div>
            <div className="mt-5 flex items-center gap-3.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[var(--l-line)]">
                <div
                  className="h-full w-[68%]"
                  style={{ background: "linear-gradient(to right,#1F5C4D,#8FCDB6)" }}
                />
              </div>
              <span className="text-[12.5px] font-semibold text-[var(--l-ink)]">42:10 / 61:04</span>
            </div>
            <div className="mt-2 text-[12.5px] text-[var(--l-ink-2)]">
              Class recording — Week 9 · resumes automatically
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
