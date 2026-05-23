"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { Theme } from "@/lib/auth/guards";

/**
 * Reconciles the locally stored (localStorage) theme with the value saved on
 * the user's account, so the preference follows them across devices. Runs once
 * on mount; on a brand-new device this may cause a single brief correction.
 */
export function ThemeSync({ initialTheme }: { initialTheme: Theme }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== initialTheme) {
      setTheme(initialTheme);
    }
    // Only sync from the account value on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTheme]);

  return null;
}
