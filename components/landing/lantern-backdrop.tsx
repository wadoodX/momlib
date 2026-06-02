"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

// The lantern canvas is loaded client-only and pinned as a fixed, full-page
// backdrop so the lanterns stay behind every section as you scroll. Content
// sections are slightly translucent so the glow shows through.
const HeroLantern = dynamic(() => import("./hero-lantern"), { ssr: false });

export function LanternBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <HeroLantern animate={!reduce} />
    </div>
  );
}
