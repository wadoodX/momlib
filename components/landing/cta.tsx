import Link from "next/link";
import { Reveal } from "./reveal";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center sm:py-36">
      {/* warm lantern-glow behind the closing pitch */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

      <Reveal className="relative mx-auto max-w-2xl">
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-6xl">
          Light up your library today.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-muted">
          Join the teachers and students keeping everything in one calm, searchable home.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md bg-sage px-8 py-4 text-sm font-semibold text-paper shadow-lg shadow-sage/20 transition-colors hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go Pro
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center rounded-md border border-line px-8 py-4 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start free
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
