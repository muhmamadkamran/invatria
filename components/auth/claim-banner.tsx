"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { useAuthUI } from "./auth-ui";
import { cn } from "@/lib/utils";

/**
 * Explains the account requirement before saving or publishing.
 */
export function ClaimBanner({
  className,
  tone = "default",
}: {
  className?: string;
  /** "publish" wording is used on the last builder step. */
  tone?: "default" | "publish";
}) {
  const { enabled, loading, isAnonymous, email, emailConfirmed } = useAuth();
  const { openAuth } = useAuthUI();

  if (!enabled || loading) return null;
  if (email && !isAnonymous && emailConfirmed) return null;

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
            ? "Sign in before publishing"
            : "Save your invitations to your account"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-charcoal-400">
          {tone === "publish"
            ? "Create an account or sign in to save your invitation and publish a link your guests can open."
            : "Create an account or sign in with your confirmed email to make and save invitations and access replies from any device."}
        </p>
      </div>

      <Button
        size="sm"
        className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
        onClick={() => openAuth("claim")}
      >
        Sign in or sign up
      </Button>
    </div>
  );
}
