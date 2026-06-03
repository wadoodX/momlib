import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-sm text-center sm:text-left">
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              Nibras<span className="text-gold">.</span>
            </span>
            <p className="mt-3 text-sm leading-6 text-muted">
              The digital library for Islamic studies — a calm home for teachers to publish and
              students to learn.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted">
            <a href="#what" className="transition-colors hover:text-gold">What it is</a>
            <a href="#how" className="transition-colors hover:text-gold">How it works</a>
            <a href="#features" className="transition-colors hover:text-gold">Features</a>
            <Link href="/pricing" className="transition-colors hover:text-gold">Pricing</Link>
            <Link href="/login" className="transition-colors hover:text-gold">Sign in</Link>
          </nav>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-center text-xs text-muted sm:text-left">
          © {new Date().getFullYear()} Nibras. A quiet library for Alimiyyah and Islamic studies.
        </p>
      </div>
    </footer>
  );
}
