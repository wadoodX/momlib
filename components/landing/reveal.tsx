import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Layout wrapper for landing-page sections. This used to run a scroll-triggered
 * fade+rise (IntersectionObserver → `.reveal--in`), but that per-section
 * transition was removed in favor of a single static flow — the page now just
 * renders as one piece. Kept as a thin wrapper (with `delay`/`y` still in the
 * props type) so the section call sites don't need to change.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={cn(className)}>{children}</div>;
}
