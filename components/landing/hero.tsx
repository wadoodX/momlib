"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { Navbar5 } from "@/components/ui/navbar-5";

// WebGL canvas: client-only (touches window / WebGL), so disable SSR.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const ease = [0.21, 0.47, 0.32, 0.98] as const;

function Sprig({ className }: { className?: string }) {
  return (
    <svg className={className} width="60" height="22" viewBox="0 0 60 22" fill="none" aria-hidden="true">
      <path d="M2 11h18M58 11H40" stroke="currentColor" strokeWidth="1" />
      <path d="M30 2c-2.6 2-4 4.8-4 8.4 0 .6.05 1.2.15 1.8.7-.4 1.4-1 2-1.7 1.4-1.7 1.85-4.2 1.85-8.5zM30 2c2.6 2 4 4.8 4 8.4 0 .6-.05 1.2-.15 1.8-.7-.4-1.4-1-2-1.7C30.45 8.8 30 6.3 30 2z" fill="currentColor" />
      <circle cx="30" cy="15.5" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? // reduced motion: skip the initial hidden state so content is shown
        // immediately (otherwise the SSR opacity:0 is never cleared).
        { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <section className="relative isolate flex min-h-[90vh] flex-col overflow-hidden bg-paper text-ink">
      {/* soft sage leaf glow in the corners */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-sage/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      {/* full-bleed interactive 3D constellation behind the content */}
      <div className="absolute inset-0 z-0">
        <HeroScene animate={!reduce} />
      </div>
      {/* soft elliptical scrim only behind the text so the headline stays readable
          while the network shows boldly toward the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 56% at 50% 50%, rgba(240,235,222,0.74) 0%, rgba(240,235,222,0.42) 40%, rgba(240,235,222,0) 72%)",
        }}
      />

      <div className="grain pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-multiply" />

      <div className="relative z-10">
        <Navbar5 />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-12 text-center">
        <motion.div {...rise(0.05)} className="text-gold">
          <Sprig />
        </motion.div>

        <motion.h1
          {...rise(0.12)}
          className="font-display mt-7 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-ink"
        >
          A quiet home for your Islamic studies notes.
        </motion.h1>

        <motion.p {...rise(0.24)} className="mt-6 max-w-xl text-lg leading-8 text-muted">
          Nibras keeps every course, chapter, and resource in one calm, searchable place, so your
          notes are always a click away.
        </motion.p>

        <motion.div {...rise(0.36)} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-sage px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-sage-deep"
          >
            Begin your journey
          </Link>
          <a
            href="#features"
            className="inline-flex items-center rounded-md border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            See what is inside
          </a>
        </motion.div>
      </div>
    </section>
  );
}
