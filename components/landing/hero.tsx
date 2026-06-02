"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Navbar5 } from "@/components/ui/navbar-5";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <section className="relative isolate flex min-h-[92vh] flex-col overflow-hidden bg-transparent text-ink">
      {/* soft corner glows (the lanterns themselves are the page-wide backdrop) */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-sage/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      {/* theme-aware scrim keeps the headline readable over the lantern glow */}
      <div className="hero-scrim pointer-events-none absolute inset-0 z-0" />
      <div className="grain pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-multiply" />

      <div className="relative z-10">
        <Navbar5 />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-12 text-center">
        <motion.p {...rise(0.05)} className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
          The digital library for Islamic studies
        </motion.p>

        <motion.h1
          {...rise(0.12)}
          className="font-display mt-6 max-w-3xl text-[clamp(2.5rem,6.4vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink"
        >
          Every lesson, lit and in its place.
        </motion.h1>

        <motion.p {...rise(0.24)} className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Nibras gives teachers a calm home to publish their courses — and gives students one
          searchable place to browse, preview, and pick up every note, file, and recording.
        </motion.p>

        <motion.div {...rise(0.36)} className="mt-9 flex flex-wrap items-center justify-center gap-4">
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
        </motion.div>

        <motion.p {...rise(0.46)} className="mt-5 text-xs text-muted">
          Free for students · Pro from <span className="font-semibold text-ink">$4/mo</span>
        </motion.p>
      </div>
    </section>
  );
}
