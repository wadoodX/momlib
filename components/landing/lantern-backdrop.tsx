"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The lantern canvas is loaded client-only and pinned as a fixed, full-page
// backdrop so the lanterns stay behind every section as you scroll. Content
// sections are slightly translucent so the glow shows through.
const HeroLantern = dynamic(() => import("./hero-lantern"), { ssr: false });

// Local prefers-reduced-motion hook (replaces motion's useReducedMotion so the
// `motion` dependency can be dropped — it was the only remaining consumer).
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

export function LanternBackdrop() {
  const reduce = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <HeroLantern animate={!reduce} />
    </div>
  );
}
