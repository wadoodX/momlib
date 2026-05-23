"use client";

import Link from "next/link";
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
  { href: "/search", label: "Search" },
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

  return (
    <nav className="mb-10 grid grid-cols-3 items-center gap-4 text-sm">
      <Link href="/dashboard" className="justify-self-start text-sm font-semibold uppercase tracking-[0.25em] text-gold">
        Nibras
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-5">
        {visibleLinks.map((link) => {
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
        })}
      </div>

      <div className="justify-self-end">
        <UserMenu displayName={displayName} email={email} />
      </div>
    </nav>
  );
}
