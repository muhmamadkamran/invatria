"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative grid size-10 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-body)] transition-colors duration-300 hover:border-gold/50 hover:text-gold",
        className,
      )}
    >
      <Sun
        strokeWidth={1.3}
        className={cn(
          "absolute size-[1.05rem] transition-all duration-500 ease-[var(--ease-luxe)]",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        strokeWidth={1.3}
        className={cn(
          "absolute size-[1.05rem] transition-all duration-500 ease-[var(--ease-luxe)]",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
