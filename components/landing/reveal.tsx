"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Scroll-in fade+rise. Content is VISIBLE by default — the hidden state lives only
 * in the CSS keyframe (`reveal-rise`), triggered by adding `reveal--in` once the
 * element scrolls into view. If JS fails / IntersectionObserver is unavailable,
 * content stays visible instead of stranded at opacity:0. `prefers-reduced-motion`
 * is honored by the CSS `@media` override in globals.css.
 */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "reveal--in", className)}
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
