"use client";

import { Link } from "next-view-transitions";
import { Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  displayName: string | null;
  email: string;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "");
  return letters.toUpperCase() || source[0]?.toUpperCase() || "?";
}

export function UserMenu({ displayName, email }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-10 items-center justify-center rounded-full bg-sage text-sm font-semibold text-paper outline-none ring-offset-2 ring-offset-paper transition hover:bg-sage-deep focus-visible:ring-2 focus-visible:ring-sage"
      >
        {initials(displayName, email)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold text-ink">{displayName || "Your account"}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/logout" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
