"use client";

import { useEffect, useState } from "react";
import type { LangCode } from "@/lib/types";
import { t } from "@/lib/i18n";
import { toDateTime } from "@/lib/utils";
import { InvReveal } from "./parts";

function diff(target: Date | null) {
  if (!target) return null;
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({
  date,
  time,
  language = "en",
}: {
  date: string;
  time: string;
  language?: LangCode;
}) {
  const target = toDateTime(date, time);
  /* Starts null so server and first client render agree; the real numbers
     arrive on the first tick. */
  const [left, setLeft] = useState<ReturnType<typeof diff>>(null);
  const [mounted, setMounted] = useState(false);
  const copy = t(language);

  useEffect(() => {
    setMounted(true);
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  const units = [
    { label: copy.days, value: left?.days },
    { label: copy.hours, value: left?.hours },
    { label: copy.minutes, value: left?.minutes },
    { label: copy.seconds, value: left?.seconds },
  ];

  if (mounted && !left) {
    return (
      <p
        className="text-center text-[clamp(1.5rem,5vw,2.25rem)] font-light italic"
        style={{ color: "var(--t-accent)", fontFamily: "var(--t-display)" }}
      >
        {copy.theDay}
      </p>
    );
  }

  return (
    <div>
      <p
        className="mb-6 text-center text-[0.625rem] uppercase tracking-[0.3em]"
        style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
      >
        {copy.countdownTo}
      </p>
      <ul className="grid grid-cols-4 gap-2 sm:gap-4">
        {units.map((u, i) => (
          <li key={u.label}>
            <InvReveal delay={i * 0.08} y={18}>
              <div
                className="relative overflow-hidden rounded-2xl border py-5 text-center sm:py-7"
                style={{
                  borderColor: "var(--t-line)",
                  background:
                    "color-mix(in oklab, var(--t-surface) 70%, transparent)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <span
                  className="block text-[clamp(1.5rem,6vw,2.75rem)] font-light leading-none tabular-nums"
                  style={{
                    color: "var(--t-ink)",
                    fontFamily: "var(--t-display)",
                  }}
                  suppressHydrationWarning
                >
                  {u.value === undefined
                    ? "--"
                    : String(u.value).padStart(2, "0")}
                </span>
                <span
                  className="mt-2 block text-[0.5rem] uppercase tracking-[0.22em] sm:text-[0.5625rem]"
                  style={{
                    color: "var(--t-ink-soft)",
                    fontFamily: "var(--t-label)",
                  }}
                >
                  {u.label}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-6 bottom-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--t-accent), transparent)",
                    opacity: 0.5,
                  }}
                />
              </div>
            </InvReveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
