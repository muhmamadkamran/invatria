"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Section, Container, SectionHeading } from "./section";
import { CardPreview } from "@/components/invitation/card-preview";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { TEMPLATES, type TemplateDef } from "@/lib/templates";
import { demoInvitation } from "@/lib/defaults";
import { getCategory } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TemplateCard({
  template,
  index = 0,
  className,
  /** Preview this design as it would look for a particular occasion. */
  occasion = "wedding",
}: {
  template: TemplateDef;
  index?: number;
  className?: string;
  occasion?: CategoryId;
}) {
  const { theme } = template;

  return (
    <Reveal
      delay={(index % 3) * 0.09}
      duration={0.9}
      className={cn("h-full", className)}
    >
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-surface-raised)] transition-all duration-600 ease-[var(--ease-luxe)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)]">
        {/* preview stage, painted in the template's own canvas colour */}
        <div
          className="relative overflow-hidden px-8 pb-10 pt-10"
          style={{
            background: `linear-gradient(160deg, ${theme.bgAlt}, ${theme.bg})`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: `radial-gradient(ellipse at 50% 120%, ${theme.accent}33, transparent 62%)`,
            }}
          />
          <motion.div
            whileHover={{ rotateX: 4, rotateY: -5, scale: 1.035 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1100 }}
            className="relative mx-auto w-[68%] max-w-[15rem] overflow-hidden rounded-[1.35rem] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.55)]"
          >
            <CardPreview
              invitation={demoInvitation(template.id, occasion)}
              template={template}
            />
          </motion.div>

          {/* swatch rail */}
          <div className="relative mt-7 flex items-center justify-center gap-2">
            {template.swatches.map((s) => (
              <span
                key={s}
                className="size-4 rounded-full ring-1 ring-white/25"
                style={{ background: s }}
                title={s}
              />
            ))}
          </div>
        </div>

        {/* copy */}
        <div className="flex flex-1 flex-col p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-light text-[var(--color-heading)]">
                {template.name}
              </h3>
              <p className="mt-1 font-label text-[0.625rem] uppercase tracking-[0.22em] text-gold-deep dark:text-gold-light">
                {template.tagline}
              </p>
            </div>
            <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-charcoal-400 transition-all duration-500 group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:text-gold-deep">
              <ArrowUpRight className="size-4" strokeWidth={1.4} />
            </span>
          </div>

          <p className="mt-4 text-[0.8125rem] leading-relaxed text-charcoal-400">
            {template.description}
          </p>

          <ul className="mt-5 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {template.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-[0.75rem] text-charcoal-400"
              >
                <Check
                  className="mt-0.5 size-3 shrink-0 text-gold"
                  strokeWidth={2}
                />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-[var(--color-line)] pt-5">
            <p className="font-label text-[0.5625rem] uppercase tracking-[0.24em] text-charcoal-200">
              Perfect for
            </p>
            <p className="mt-1.5 font-serif text-sm italic text-[var(--color-heading)]">
              {occasion === "wedding"
                ? template.bestForLabel.join(" · ")
                : `${getCategory(occasion).label} · ${template.bestForLabel[0]}`}
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/create?template=${template.id}&occasion=${occasion}`}>
                Use this design
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/templates/${template.id}`}>Preview</Link>
            </Button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function TemplatesShowcase() {
  return (
    <Section id="templates">
      <Container size="wide">
        <SectionHeading
          eyebrow="Six premium concepts"
          title="Designs that carry"
          italic="the whole feeling"
          lead="Each one is a complete world — its own type, palette, ornament, motion and background motif. Pick the one that matches your day and change anything you like."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-14 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/templates">See every template</Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
