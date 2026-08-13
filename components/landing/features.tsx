"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icon";
import { Section, Container, SectionHeading } from "./section";
import { FEATURES, FEATURE_GROUPS } from "@/lib/features";
import { cn } from "@/lib/utils";

type Filter = "All" | (typeof FEATURE_GROUPS)[number];

const FILTERS: Filter[] = ["All", ...FEATURE_GROUPS];

const GROUP_HINT: Record<string, string> = {
  All: "Every one of them, on every invitation.",
  Create: "Getting an invitation out of your head and onto the page.",
  Craft: "The details that make it feel expensive.",
  Share: "Getting it in front of everyone you know.",
  Host: "Knowing who's coming, and what they need.",
};

export function Features() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = filter === "All" ? FEATURES : FEATURES.filter((f) => f.group === filter);

  return (
    <Section id="features" tone="sunken">
      {/* faint gold wash top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[38rem] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--color-champagne), transparent 68%)" }}
      />

      <Container>
        <SectionHeading
          eyebrow="Everything included"
          title="Twenty-two features."
          italic="Zero of them locked."
          lead="Other tools call these premium. Here they are the product. Nothing behind a plan, nothing that expires, nothing that asks for a card."
        />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "relative rounded-full px-5 py-2.5 font-label text-[0.6875rem] uppercase tracking-[0.18em] transition-colors duration-300",
                filter === f
                  ? "text-ivory dark:text-charcoal"
                  : "text-charcoal-400 hover:text-[var(--color-heading)]",
              )}
            >
              {filter === f ? (
                <motion.span
                  layoutId="feature-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-charcoal dark:bg-champagne"
                />
              ) : null}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>

        <p
          key={filter}
          className="mt-5 text-center text-sm italic text-charcoal-400"
        >
          {GROUP_HINT[filter]}
        </p>

        <motion.ul
          layout
          className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {shown.map((f, i) => (
              <motion.li
                key={f.title}
                layout
                initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{
                  duration: 0.55,
                  delay: Math.min(i * 0.028, 0.35),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-6 transition-all duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1 hover:border-gold/35 hover:shadow-[var(--shadow-lifted)]"
              >
                {/* sweep of gold on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,transparent,var(--color-gold),transparent)] transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100"
                />

                <span className="grid size-11 place-items-center rounded-2xl border border-gold/20 bg-gold/8 text-gold-deep transition-colors duration-500 group-hover:bg-gold/14 dark:text-gold-light">
                  <Icon name={f.icon} className="size-[1.15rem]" />
                </span>

                <h3 className="mt-5 font-serif text-[1.05rem] leading-snug text-[var(--color-heading)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-charcoal-400">
                  {f.detail}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </Container>
    </Section>
  );
}
