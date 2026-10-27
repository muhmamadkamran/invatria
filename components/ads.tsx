"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/* ============================================================================
   Advertising is the only way Invitra makes money, so it has rules:
   ── never above the fold, never inside the envelope reveal, never over
      content, never animated, never more than one per screenful, and always
      labelled. Everything the product does stays free.
   ========================================================================= */

export function AdSenseScript() {
  if (!CLIENT) return null;
  return (
    <Script
      async
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
    />
  );
}

export function AdSlot({
  slot,
  format = "horizontal",
  className,
  label = "Advertisement",
}: {
  slot?: string;
  format?: "horizontal" | "rectangle" | "vertical";
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || pushed.current || !ref.current) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blockers are fine — the frame simply stays empty */
    }
  }, []);

  const minHeight =
    format === "rectangle" ? "min-h-[250px]" : format === "vertical" ? "min-h-[600px]" : "min-h-[90px]";

  return (
    <aside
      aria-label={label}
      className={cn("mx-auto w-full max-w-5xl px-5 sm:px-8", className)}
    >
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-sunken)]/50 p-3">
        <p className="mb-2 text-center font-label text-[0.5625rem] uppercase tracking-[0.3em] text-charcoal-200">
          {label}
        </p>
        {CLIENT ? (
          <ins
            ref={ref}
            className={cn("adsbygoogle block w-full", minHeight)}
            data-ad-client={CLIENT}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div
            className={cn(
              "grid w-full place-items-center rounded-2xl bg-[var(--color-surface-raised)]/60",
              minHeight,
            )}
          >
            <p className="max-w-sm px-6 text-center text-xs leading-relaxed text-charcoal-200">
              Ad space. This is how Invitra stays free — no plans, no upgrades,
              nothing locked.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
