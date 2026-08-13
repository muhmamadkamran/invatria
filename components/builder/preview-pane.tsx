"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, RefreshCw } from "lucide-react";
import { useBuilder } from "./context";
import { InvitationView } from "@/components/invitation/view";
import { CardPreview } from "@/components/invitation/card-preview";
import { getOccasion } from "@/lib/occasions";
import { cn } from "@/lib/utils";

const DEVICE = { width: 390, height: 800 };

/** The live preview. The invitation renders at real phone dimensions and is
 *  scaled down to fit, so what you see is genuinely the page guests get —
 *  not a stylised mock of it. */
export function PreviewPane({ compact = false }: { compact?: boolean }) {
  const { inv: raw } = useBuilder();

  /* Empty fields would render as gaps; fall back to the same placeholders the
     form shows, which are the ones this occasion uses. */
  const o = getOccasion(raw.category);
  const inv = {
    ...raw,
    hostPrimary: raw.hostPrimary || o.primaryPlaceholder,
    hostSecondary: raw.hostSecondary || o.secondaryPlaceholder,
    venueName: raw.venueName || o.demo.venue,
  };
  const [mode, setMode] = useState<"phone" | "card">("phone");
  const [scale, setScale] = useState(1);
  const [nonce, setNonce] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / DEVICE.width, height / DEVICE.height, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)] p-1">
          {(
            [
              { id: "phone", icon: Smartphone, label: "Full invitation" },
              { id: "card", icon: Monitor, label: "Card" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              title={m.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-label text-[0.5625rem] uppercase tracking-[0.16em] transition-colors duration-300",
                mode === m.id
                  ? "bg-charcoal text-ivory dark:bg-champagne dark:text-charcoal"
                  : "text-charcoal-400 hover:text-[var(--color-heading)]",
              )}
            >
              <m.icon className="size-3" strokeWidth={1.5} />
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          title="Replay the opening"
          aria-label="Replay the opening"
          className="grid size-8 place-items-center rounded-full border border-[var(--color-line)] text-charcoal-400 transition-colors hover:border-gold/50 hover:text-gold-deep"
        >
          <RefreshCw className="size-3.5" strokeWidth={1.4} />
        </button>
      </div>

      <div
        ref={boxRef}
        className={cn(
          "relative flex-1 overflow-hidden rounded-[2rem]",
          compact ? "min-h-[28rem]" : "min-h-[34rem]",
        )}
      >
        {mode === "card" ? (
          <div className="grid size-full place-items-center p-6">
            <div className="w-full max-w-[16rem] overflow-hidden rounded-[1.35rem] shadow-[var(--shadow-float)]">
              <CardPreview invitation={inv} />
            </div>
          </div>
        ) : (
          <div className="grid size-full place-items-center">
            {/* phone shell */}
            <div
              className="relative rounded-[2.4rem] border-[10px] border-charcoal bg-charcoal shadow-[var(--shadow-float)]"
              style={{
                width: DEVICE.width * scale + 20,
                height: DEVICE.height * scale + 20,
              }}
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-1.5 z-20 h-1 w-16 -translate-x-1/2 rounded-full bg-white/25"
              />
              <div
                className="relative size-full overflow-hidden rounded-[1.7rem]"
                style={{ width: DEVICE.width * scale, height: DEVICE.height * scale }}
              >
                <div
                  className="origin-top-left overflow-y-auto overflow-x-hidden"
                  style={{
                    width: DEVICE.width,
                    height: DEVICE.height,
                    transform: `scale(${scale})`,
                  }}
                >
                  {/* keyed so "replay" genuinely remounts the reveal */}
                  <InvitationView key={nonce} invitation={inv} preview />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[0.6875rem] text-charcoal-400">
        Live preview · saves as you type
      </p>
    </div>
  );
}
