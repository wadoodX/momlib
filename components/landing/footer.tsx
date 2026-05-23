import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 border-t border-line px-6 py-12 sm:flex-row">
        <span className="font-display text-base font-semibold tracking-tight text-ink">
          Nibras<span className="text-gold">.</span>
        </span>
        <p className="text-sm text-muted">A quiet library for Alimiyyah and Islamic Studies notes.</p>
        <Link href="/login" className="text-sm font-medium text-ink transition-opacity hover:opacity-70">
          Sign in
        </Link>
      </div>
    </footer>
  );
}
