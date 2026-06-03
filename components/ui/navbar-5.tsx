"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

export const Navbar5 = () => {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-6xl px-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            Nibras<span className="text-gold">.</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) =>
              link.href.includes("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-ink transition-opacity hover:opacity-60"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-ink transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-ink transition-opacity hover:opacity-60"
            >
              Sign in
            </Link>
            <ThemeToggle />
            <Button asChild>
              <Link href="/pricing">Go Pro</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
                    Nibras<span className="text-gold">.</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-4">
                {links.map((link) =>
                  link.href.includes("#") ? (
                    <a key={link.href} href={link.href} className="font-medium text-ink">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className="font-medium text-ink">
                      {link.label}
                    </Link>
                  ),
                )}
                <Link href="/login" className="font-medium text-ink">
                  Sign in
                </Link>
                <Button asChild>
                  <Link href="/pricing">Go Pro</Link>
                </Button>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </section>
  );
};
