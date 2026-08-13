"use client";

import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      // Follow the device by default; the toggle still overrides and persists.
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="invitra-theme"
    >
      {children}
    </NextThemes>
  );
}
