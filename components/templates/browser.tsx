"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Section, SectionHeading } from "@/components/landing/section";
import { TemplateCard } from "@/components/landing/templates-showcase";
import { TEMPLATES } from "@/lib/templates";
import { CATEGORIES, getCategory } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

function Browser() {
  const [occasion, setOccasion] = useState<CategoryId | "all">("all");
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("occasion");
    if (initial && CATEGORIES.some((c) => c.id === initial)) setOccasion(initial as CategoryId);
  }, []);

  const shown = useMemo(
    () =>
      occasion === "all"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.bestFor.includes(occasion)),
    [occasion],
  );

  return (
    <Section className="pt-36 sm:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] -z-10 bg-[radial-gradient(ellipse_90%_100%_at_50%_0%,var(--color-champagne)_0%,transparent_70%)] opacity-70 dark:opacity-30"
      />

      <Container size="wide">
        <SectionHeading
          eyebrow="The full collection"
          title="Every design,"
          italic="every feature, free"
          lead="Filter by what you're planning. Each design adapts its wording, sections and ornament to the occasion you pick — and you can still change all of it."
        />

        {/* occasion filter */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => {
            const active = occasion === id;
            const label = id === "all" ? "All occasions" : getCategory(id).label;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setOccasion(id as CategoryId | "all")}
                aria-pressed={active}
                className={cn(
                  "relative rounded-full border px-4 py-2 font-label text-[0.6875rem] uppercase tracking-[0.14em] transition-all duration-300",
                  active
                    ? "border-transparent text-ivory dark:text-charcoal"
                    : "border-[var(--color-line)] text-charcoal-400 hover:border-gold/40 hover:text-[var(--color-heading)]",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="occasion-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-charcoal dark:bg-champagne"
                  />
                ) : null}
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-charcoal-400">
          {shown.length} {shown.length === 1 ? "design" : "designs"}
          {occasion !== "all" ? ` suited to ${getCategory(occasion).label.toLowerCase()}` : ""}
        </p>

        <motion.div layout className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <TemplateCard
                  template={t}
                  index={i}
                  className="h-full"
                  occasion={occasion === "all" ? "wedding" : occasion}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!shown.length ? (
          <p className="mt-16 text-center font-display text-2xl italic text-charcoal-400">
            Nothing matches that yet — try another occasion.
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

export function TemplateBrowser() { return <Browser />; }
