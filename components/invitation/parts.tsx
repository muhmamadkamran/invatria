"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";

import { motion } from "framer-motion";
import type { TemplateDef } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Ornament } from "./pattern";

/** Invitation sections stay readable before JavaScript runs; observers only
 *  add a small movement instead of revealing hidden content. */
export function InvReveal({
  children,
  className,
  delay = 0,
  y = 30,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ y: Math.max(-12, Math.min(12, y)) }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function InvSection({
  id,
  children,
  className,
  alt = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  alt?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("relative px-5 py-20 sm:px-8 sm:py-24", className)}
      style={
        alt
          ? { background: "color-mix(in oklab, var(--t-bg-alt) 92%, transparent)" }
          : undefined
      }
    >
      <div className="relative mx-auto w-full max-w-3xl">{children}</div>
    </section>
  );
}

export function InvHeading({
  template,
  eyebrow,
  title,
  lead,
  className,
}: {
  template: TemplateDef;
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <InvReveal className={cn("text-center", className)}>
      {eyebrow ? (
        <p
          className="text-[0.625rem] uppercase tracking-[0.32em]"
          style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className="mt-3 text-[clamp(1.75rem,5vw,2.5rem)] font-light leading-tight"
        style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
      >
        {title}
      </h2>
      <Ornament template={template} width={180} className="mt-5 opacity-75" />
      {lead ? (
        <p
          className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed"
          style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
        >
          {lead}
        </p>
      ) : null}
    </InvReveal>
  );
}

/** A framed panel — the invitation equivalent of a card. */
export function InvPanel({
  children,
  className,
  glass = false,
}: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border p-6", className)}
      style={{
        borderColor: "var(--t-line)",
        background: glass
          ? "color-mix(in oklab, var(--t-surface) 55%, transparent)"
          : "var(--t-surface)",
        backdropFilter: glass ? "blur(16px)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function InvLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("text-[0.625rem] uppercase tracking-[0.26em]", className)}
      style={{ color: "var(--t-accent)", fontFamily: "var(--t-label)" }}
    >
      {children}
    </p>
  );
}
