"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { useAuthUI } from "./auth-ui";
import { cn } from "@/lib/utils";

/**
 * Shown to a visitor who has made something but has no account yet.
 *
 * Deliberately placed where it is true rather than where it is loudest: at
 * publish, and above their list of invitations — the two moments they have
 * something to lose.
 */
export function ClaimBanner({
  className,
  tone = "default",
}: {
  className?: string;
  /** "publish" wording is used on the last builder step. */
  tone?: "default" | "publish";
}) {
  const { enabled, loading, isAnonymous, email } = useAuth();
  const { openAuth } = useAuthUI();

  if (!enabled || loading) return null;
  if (email && !isAnonymous) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-gold/30 bg-gold/6 p-5 sm:flex sm:items-center sm:gap-5",
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold-deep dark:text-gold-light">
        <ShieldAlert className="size-[1.05rem]" strokeWidth={1.4} />
      </span>

      <div className="mt-4 min-w-0 flex-1 sm:mt-0">
        <p className="font-serif text-[0.95rem] text-[var(--color-heading)]">
          {tone === "publish"
            ? "Save this before you share it"
            : "These are only saved to this browser"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-charcoal-400">
          {tone === "publish"
            ? "Your link will work either way — but without an account you won't be able to edit it, or see who replied, from any other device."
            : "Add an email and you can reach them from your phone, and they'll survive clearing your browser data."}
        </p>
      </div>

      <Button
        size="sm"
        className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
        onClick={() => openAuth("claim")}
      >
        Save my work
      </Button>
    </div>
  );
}
