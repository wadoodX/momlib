"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";

// In-page section anchors (sections live in app/page.tsx in this order).
const LINKS = [
  { label: "The sciences", href: "#sciences" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

function Brand() {
  return (
    <Link
      href="/"
      className="l-serif text-[28px] font-semibold leading-none text-[var(--l-ink)]"
    >
      Nibras<span className="text-[var(--l-gold)]">.</span>
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-10 lg:px-14">
        <Brand />

        {/* Center links — desktop only */}
        <nav className="hidden items-center gap-9 text-sm font-medium text-[var(--l-ink-2)] lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-[var(--l-ink)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right actions — desktop */}
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--l-ink)] transition-opacity hover:opacity-70"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex rounded-lg bg-[var(--l-btn)] px-[22px] py-[11px] text-[13.5px] font-semibold text-[var(--l-cream-2)] transition-colors hover:bg-[var(--l-teal)]"
          >
            Start free
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--l-line)] bg-[var(--l-card)] text-[var(--l-ink)] lg:hidden"
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute inset-x-3 top-[76px] z-40 rounded-2xl border border-[var(--l-line)] bg-[var(--l-card)] p-4 shadow-[0_20px_50px_rgba(22,52,46,0.16)] lg:hidden">
          <nav className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--l-ink-2)] transition-colors hover:bg-[var(--l-card-2)] hover:text-[var(--l-ink)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-[var(--l-line)] pt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 text-sm font-medium text-[var(--l-ink)]"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => setOpen(false)}
              className="ml-auto inline-flex rounded-lg bg-[var(--l-btn)] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--l-cream-2)]"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
