const STATS = [
  { value: "1,200+", label: "students learning" },
  { value: "8", label: "sciences covered" },
  { value: "3,500+", label: "resources shared" },
];

export function QuoteStats() {
  return (
    <section className="px-5 pb-24 pt-5 sm:px-10 lg:px-14 lg:pb-[100px]">
      <div className="grid items-center gap-10 rounded-[20px] border border-[var(--l-line)] bg-[var(--l-card)] p-8 sm:p-16 lg:grid-cols-[1fr_280px] lg:gap-16">
        <div>
          <span className="l-serif block text-[56px] leading-[0.5] text-[var(--l-gold-2)]" aria-hidden>
            “
          </span>
          <p className="l-serif mt-[18px] text-[clamp(1.5rem,3vw,29px)] leading-[1.5] text-[var(--l-ink)]">
            I used to lose handouts constantly. Now I just search and the right chapter is there in
            seconds — and I pick up exactly where I left off.
          </p>
          <div className="mt-[22px] text-sm font-semibold text-[var(--l-ink)]">
            Maryam Yusuf <span className="font-normal text-[var(--l-ink-2)]">· Alimiyyah student</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-[var(--l-line)] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="l-serif text-[40px] font-medium leading-none text-[var(--l-ink)]">
                {s.value}
              </div>
              <div className="mt-1 text-[12.5px] text-[var(--l-ink-2)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
