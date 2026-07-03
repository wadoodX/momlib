import Link from "next/link";

const PERKS = [
  "Offline downloads for study on the go",
  "Early access to new material as it's published",
  "Priority support from the Nibras team",
  "Everything in Free, always included",
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-4 scroll-mt-20 rounded-[20px] px-7 py-16 text-[var(--l-cream-2)] sm:mx-6 sm:px-12 lg:px-[72px] lg:py-20"
      style={{ background: "linear-gradient(150deg,#1B4A3F 0%,#173F36 100%)" }}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-[72px]">
        <div>
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.32em] text-[var(--l-gold-3)]">
            Pricing
          </span>
          <h2 className="l-serif mt-3.5 text-[clamp(2rem,4.4vw,48px)] font-medium leading-[1.1] text-[var(--l-cream)]">
            The library is free.
            <br />
            Go further with Pro.
          </h2>
          <p className="mt-[18px] max-w-[440px] text-[15.5px] leading-[1.7] text-[var(--l-on-teal)]">
            Every student reads free, forever. Pro adds offline downloads, early access to new
            material, and priority support — $5/month.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3.5">
            <Link
              href="/pricing"
              className="btn-gold inline-flex rounded-lg bg-[var(--l-gold-3)] px-7 py-3.5 text-[14.5px] font-bold text-[#1c2b1e]"
            >
              Choose Pro
            </Link>
            <Link
              href="/login?mode=signup"
              className="inline-flex rounded-lg border px-7 py-[13px] text-[14.5px] font-semibold text-[var(--l-cream)] transition-colors hover:border-[var(--l-cream)]"
              style={{ borderColor: "rgba(247,250,242,0.35)" }}
            >
              Start free
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {PERKS.map((perk) => (
            <div
              key={perk}
              className="flex items-center gap-4 rounded-xl border px-[22px] py-[18px]"
              style={{ background: "rgba(247,250,242,0.07)", borderColor: "rgba(247,250,242,0.14)" }}
            >
              <span className="text-[var(--l-gold-3)]" aria-hidden>
                ◆
              </span>
              <span className="text-[15px] text-[var(--l-cream-2)]">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
