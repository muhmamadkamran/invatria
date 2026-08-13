"use client";

import type { Invitation } from "@/lib/types";
import { getOccasion } from "@/lib/occasions";
import { cn } from "@/lib/utils";

/* ============================================================================
   The names block.

   A wedding stacks two names around an ampersand. A birthday sets one name
   large with a milestone beneath it. A launch leads with the event title and
   puts the company under it in small caps. Every surface that shows the names
   — hero, card, envelope, footer — renders through here so they never drift.
   ========================================================================= */

type Variant = "hero" | "card" | "envelope" | "footer";

const SIZES: Record<
  Variant,
  { name: string; join: string; sub: string; org: string; orgSub: string; gap: string }
> = {
  hero: {
    name: "text-[clamp(2.75rem,13vw,5.5rem)] leading-[0.95]",
    join: "text-[clamp(1.1rem,3vw,1.6rem)] my-2",
    sub: "mt-3 text-[clamp(1rem,3.6vw,1.6rem)]",
    org: "text-balance text-[clamp(1.6rem,5.5vw,3rem)] leading-[1.1] tracking-[0.02em]",
    orgSub: "mt-5 text-[0.6875rem] tracking-[0.34em]",
    gap: "",
  },
  card: {
    name: "text-[clamp(1.5rem,7cqw,2.6rem)] leading-[0.95]",
    join: "text-[clamp(0.6rem,2.4cqw,0.9rem)] my-[1%]",
    sub: "mt-[3%] text-[clamp(0.5rem,2.3cqw,0.85rem)]",
    org: "text-balance text-[clamp(0.8rem,4cqw,1.35rem)] leading-[1.15] tracking-[0.02em]",
    orgSub: "mt-[4%] text-[clamp(0.4rem,1.5cqw,0.6rem)] tracking-[0.3em]",
    gap: "",
  },
  envelope: {
    name: "text-[1.85rem] leading-none",
    join: "text-xs my-0.5",
    sub: "mt-2 text-sm",
    org: "text-[1.15rem] leading-tight tracking-[0.02em]",
    orgSub: "mt-2.5 text-[0.5rem] tracking-[0.28em]",
    gap: "",
  },
  footer: {
    name: "text-[clamp(1.75rem,7vw,2.5rem)] leading-tight",
    join: "text-base my-1",
    sub: "mt-2 text-sm",
    org: "text-[clamp(1.25rem,5vw,1.9rem)] leading-tight",
    orgSub: "mt-2 text-[0.625rem] tracking-[0.28em]",
    gap: "",
  },
};

export function InvitationNames({
  invitation,
  variant,
  className,
  /** Placeholders shown when the fields are still empty (builder preview). */
  fallback = false,
}: {
  invitation: Invitation;
  variant: Variant;
  className?: string;
  fallback?: boolean;
}) {
  const o = getOccasion(invitation.category);
  const s = SIZES[variant];

  const primary = invitation.hostPrimary || (fallback ? o.primaryPlaceholder : "");
  const secondary =
    invitation.hostSecondary || (fallback ? o.secondaryPlaceholder : "");

  /* --- an event title with its host beneath ------------------------------ */
  if (o.nameMode === "org") {
    return (
      <span className={cn("block", className)}>
        <span
          className={cn("block font-light", s.org)}
          style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={cn("block uppercase", s.orgSub)}
            style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
          >
            {secondary}
          </span>
        ) : null}
      </span>
    );
  }

  /* --- one name, with an optional line under it -------------------------- */
  if (o.nameMode === "single") {
    return (
      <span className={cn("block", className)}>
        <span
          className={cn("block", s.name)}
          style={{ color: "var(--t-ink)", fontFamily: "var(--t-script)" }}
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={cn("block italic", s.sub)}
            style={{ color: "var(--t-accent)", fontFamily: "var(--t-display)" }}
          >
            {secondary}
          </span>
        ) : null}
      </span>
    );
  }

  /* --- two names, stacked around the join word --------------------------- */
  return (
    <span className={cn("block", className)}>
      <span
        className={cn("block", s.name)}
        style={{ color: "var(--t-ink)", fontFamily: "var(--t-script)" }}
      >
        {primary}
      </span>
      {secondary ? (
        <>
          {invitation.joinWord ? (
            <span
              className={cn("block", s.join)}
              style={{ color: "var(--t-accent)", fontFamily: "var(--t-display)" }}
            >
              {invitation.joinWord}
            </span>
          ) : null}
          <span
            className={cn("block", s.name)}
            style={{ color: "var(--t-ink)", fontFamily: "var(--t-script)" }}
          >
            {secondary}
          </span>
        </>
      ) : null}
    </span>
  );
}

/** Plain-text form, for page titles, share text and the calendar entry. */
export function namesToText(invitation: Invitation) {
  const o = getOccasion(invitation.category);
  const { hostPrimary: a, hostSecondary: b, joinWord } = invitation;
  if (!b) return a;
  if (o.nameMode === "couple") return `${a} ${joinWord || "&"} ${b}`.trim();
  return `${a} — ${b}`;
}
