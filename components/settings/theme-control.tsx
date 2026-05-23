"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTheme } from "@/app/settings/actions";
import type { Theme } from "@/lib/auth/guards";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // Avoid hydration mismatch: the resolved theme is only known on the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const active = (mounted ? theme : undefined) as Theme | undefined;

  function choose(next: Theme) {
    setTheme(next); // instant, local
    startTransition(() => {
      void updateTheme(next); // persist to the account
    });
  }

  return (
    <div className="inline-grid grid-cols-3 gap-1 rounded-2xl border border-line bg-paper-soft p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={isActive}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sage text-paper shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
