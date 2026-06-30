"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// In-page section anchors (the sections live in app/page.tsx, in this order).
const SECTIONS = [
  { label: "About", href: "#what" },
  { label: "The sciences", href: "#sciences" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Who it's for", href: "#who" },
  { label: "Pricing", href: "#pricing" },
  { label: "Begin", href: "#begin" },
];

function Brand() {
  return (
    <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
      Nibras<span className="text-gold">.</span>
    </Link>
  );
}

function SectionLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <nav className={className}>
      {SECTIONS.map((s) => (
        <a
          key={s.href}
          href={s.href}
          onClick={onNavigate}
          className="block rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:bg-card hover:text-ink"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Primary nav for the public landing page — a left sidebar rail (replacing the
 * old top navbar). Brand + in-page section anchors + Sign in / Go Pro + the
 * theme toggle. On phones it collapses to a slim top bar that opens the same
 * links in a Sheet drawer.
 */
export function LandingSidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop: fixed, sticky, full-height rail. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper-soft px-5 py-7 lg:flex">
        <Brand />

        <p className="mt-8 mb-1 px-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Explore</p>
        <SectionLinks className="space-y-0.5" />

        <div className="mt-auto space-y-3 pt-6">
          <Button asChild className="w-full">
            <Link href="/pricing">Go Pro</Link>
          </Button>
          <div className="flex items-center justify-between">
            <Link href="/login" className="text-sm font-medium text-muted transition hover:text-ink">
              Sign in
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Phones: slim top bar + drawer. Sticky so the nav is always reachable. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper-soft/90 px-5 py-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <SectionLinks className="space-y-0.5" onNavigate={close} />
                <Link href="/login" onClick={close} className="px-2 text-sm font-medium text-ink">
                  Sign in
                </Link>
                <Button asChild className="w-full">
                  <Link href="/pricing" onClick={close}>
                    Go Pro
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
