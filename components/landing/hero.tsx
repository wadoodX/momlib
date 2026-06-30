import Link from "next/link";

// On-load fade+rise is pure CSS (`.hero-rise` in globals.css) with a per-element
// stagger via inline animation-delay — so the content (incl. the LCP <h1>) ships
// as static, visible SSR HTML and never depends on client JS to appear. The H1
// gets an early delay to keep LCP tight. prefers-reduced-motion is honored in CSS.
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] flex-col overflow-hidden bg-transparent text-ink">
      {/* soft corner glows give the hero some warmth on the plain paper surface */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-sage/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      {/* theme-aware scrim + grain for a calm, textured background */}
      <div className="hero-scrim pointer-events-none absolute inset-0 z-0" />
      <div className="grain pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-multiply" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-16 text-center">
        <p
          style={{ animationDelay: "0.04s" }}
          className="hero-rise text-xs font-semibold uppercase tracking-[0.35em] text-gold"
        >
          The digital library for Islamic studies
        </p>

        <h1
          style={{ animationDelay: "0.1s" }}
          className="hero-rise font-display mt-6 max-w-3xl text-[clamp(2.5rem,6.4vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink"
        >
          Every lesson, lit and in its place.
        </h1>

        <p style={{ animationDelay: "0.2s" }} className="hero-rise mt-6 max-w-2xl text-lg leading-8 text-muted">
          Nibras gives teachers a calm home to publish their courses — and gives students one
          searchable place to browse, preview, and pick up every note, file, and recording.
        </p>

        <div style={{ animationDelay: "0.3s" }} className="hero-rise mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md bg-sage px-7 py-3.5 text-sm font-semibold text-paper shadow-lg shadow-sage/20 transition-colors hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go Pro
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center rounded-md border border-line bg-paper/40 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start free
          </Link>
        </div>

        <p style={{ animationDelay: "0.38s" }} className="hero-rise mt-5 text-xs text-muted">
          Free for students · Pro from <span className="font-semibold text-ink">$4/mo</span>
        </p>
      </div>
    </section>
  );
}
