"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import { useAuthUI } from "./auth-ui";
import { cn } from "@/lib/utils";

/**
 * Header account control.
 *
 * Three states, and the middle one matters most: a visitor who has built
 * something but not claimed it is nudged, not nagged — because for them the
 * browser is the only key to their invitations.
 */
export function AccountButton({ className }: { className?: string }) {
  const { enabled, loading, email, isAnonymous } = useAuth();
  const { openAuth } = useAuthUI();
  const [menu, setMenu] = useState(false);

  // Nothing to offer without a backend, and nothing to show mid-lookup.
  if (!enabled || loading) return null;

  const signedIn = Boolean(email) && !isAnonymous;

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() => openAuth(isAnonymous ? "claim" : "signin")}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-line)] px-4 font-label text-[0.625rem] uppercase tracking-[0.16em] text-charcoal-400 transition-colors duration-300 hover:border-gold/50 hover:text-[var(--color-heading)]",
          className,
        )}
      >
        <UserRound className="size-3.5" strokeWidth={1.4} />
        {isAnonymous ? "Save my work" : "Sign in"}
      </button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-expanded={menu}
        aria-label="Account"
        className="grid size-10 place-items-center rounded-full border border-gold/30 bg-gold/8 font-label text-[0.6875rem] uppercase text-gold-deep transition-colors duration-300 hover:bg-gold/14 dark:text-gold-light"
      >
        {email!.slice(0, 1)}
      </button>

      <AnimatePresence>
        {menu ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-12 z-20 w-64 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-2 shadow-[var(--shadow-lifted)]"
            >
              <div className="px-3 py-2.5">
                <p className="flex items-center gap-1.5 font-label text-[0.5625rem] uppercase tracking-[0.2em] text-gold-deep dark:text-gold-light">
                  <ShieldCheck className="size-3" strokeWidth={1.6} />
                  Signed in
                </p>
                <p className="mt-1 truncate text-sm text-[var(--color-heading)]">
                  {email}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const { signOut } = await import("@/lib/supabase/auth");
                  const result = await signOut();
                  setMenu(false);
                  if (!result.ok) toast.error(result.error);
                  else window.location.href = "/";
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-charcoal-600 transition-colors hover:bg-cream/70 dark:text-charcoal-200 dark:hover:bg-white/5"
              >
                <LogOut className="size-3.5" strokeWidth={1.5} />
                Sign out
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
