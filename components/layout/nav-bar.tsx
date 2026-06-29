"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";

type NavBarProps = {
  role: "admin" | "student";
  displayName: string | null;
  email: string;
};

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/admin", label: "Admin", adminOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavBar({ role, displayName, email }: NavBarProps) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => !link.adminOnly || role === "admin");

  const linkItems = visibleLinks.map((link) => {
    const active = isActive(pathname, link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={
          active
            ? "font-semibold text-gold"
            : "text-muted transition hover:text-ink"
        }
      >
        {link.label}
      </Link>
    );
  });

  return (
    <nav className="mb-10 text-sm">
      {/* Top row: brand + avatar. A simple flex row on phones; the 3-column grid
          (brand | centered links | avatar) from sm up. */}
      <div className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-3">
        <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.25em] text-gold sm:justify-self-start">
          Nibras
        </Link>

        {/* Centered links — middle column on sm+, hidden on phones (shown in the row below). */}
        <div className="hidden items-center justify-center gap-5 sm:flex sm:flex-wrap">{linkItems}</div>

        <div className="sm:justify-self-end">
          <UserMenu displayName={displayName} email={email} />
        </div>
      </div>

      {/* Phones only: links on their own row, spread evenly so they never wrap raggedly. */}
      <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">{linkItems}</div>
    </nav>
  );
}
