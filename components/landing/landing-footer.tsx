import Link from "next/link";

const LINKS = [
  { label: "The sciences", href: "#sciences" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "/login" },
];

export function LandingFooter() {
  return (
    <footer>
      <div className="flex flex-col justify-between gap-10 px-5 pb-10 pt-16 sm:px-10 sm:flex-row sm:items-start lg:px-14">
        <div className="max-w-[340px]">
          <span className="l-serif text-[22px] font-semibold text-[var(--l-ink)]">
            Nibras<span className="text-[var(--l-gold)]">.</span>
          </span>
          <p className="mt-2.5 text-[13.5px] leading-[1.7] text-[var(--l-ink-2)]">
            The digital library for Islamic studies — a calm home for teachers to publish and
            students to learn.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] font-medium text-[var(--l-ink-2)]">
          {LINKS.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--l-ink)]">
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[var(--l-ink)]"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>
      </div>
      <div className="px-5 pb-9 text-xs text-[var(--l-muted)] sm:px-10 lg:px-14">
        © {new Date().getFullYear()} Nibras. A quiet library for Alimiyyah and Islamic studies.
      </div>
    </footer>
  );
}
