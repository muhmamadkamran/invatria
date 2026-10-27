"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Section, Container, SectionHeading } from "./section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { STEPS, ACTS } from "@/lib/steps";
import { cn } from "@/lib/utils";

export function HowItWorks() {
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "end 0.55"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });
  const height = useTransform(fill, (v) => `${v * 100}%`);

  return (
    <Section id="how" tone="sunken">
      <Container>
        <SectionHeading
          eyebrow="Fourteen steps"
          title="From blank page to"
          italic="sent, in one sitting"
          lead="The builder walks you through it in order. Ten of the fourteen are optional — fill in four and you already have something you'd be happy to send."
        />

        <div className="relative mt-20">
          <ol ref={trackRef} className="relative mx-auto max-w-3xl">
            {/* the rail */}
            <span
              aria-hidden
              className="absolute left-[1.4rem] top-2 hidden h-[calc(100%-1rem)] w-px bg-[var(--color-line)] sm:block"
            />
            <motion.span
              aria-hidden
              style={{ height }}
              className="absolute left-[1.4rem] top-2 hidden w-px origin-top bg-[linear-gradient(180deg,var(--color-gold),var(--color-rosegold))] sm:block"
            />

            {STEPS.map((s, i) => {
              const newAct = i === 0 || STEPS[i - 1].act !== s.act;
              return (
                <li key={s.key}>
                  {newAct ? (
                    <Reveal delay={0.05}>
                      {/* Each label is the first child of its own <li>, so a
                          `first:` variant would zero every act's top margin —
                          only Act 1 should sit flush with the heading. */}
                      <p
                        className={cn(
                          "mb-5 pl-0 font-label text-[0.625rem] uppercase tracking-[0.3em] text-gold-deep sm:pl-[4.5rem] dark:text-gold-light",
                          i === 0 ? "mt-0" : "mt-14",
                        )}
                      >
                        Act {ACTS.indexOf(s.act as (typeof ACTS)[number]) + 1} —{" "}
                        {s.act}
                      </p>
                    </Reveal>
                  ) : null}

                  <Reveal
                    direction="right"
                    duration={0.65}
                    className="group relative flex gap-5 rounded-2xl py-3.5 pl-0 pr-4 transition-colors duration-400 sm:pl-0"
                  >
                    <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-raised)] font-display text-base text-charcoal-400 transition-all duration-500 ease-[var(--ease-luxe)] group-hover:border-gold/60 group-hover:bg-gold/10 group-hover:text-gold-deep dark:group-hover:text-gold-light">
                      {String(s.n).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 pt-1.5">
                      <h3 className="flex flex-wrap items-center gap-2.5 font-serif text-[1.0625rem] text-[var(--color-heading)]">
                        {s.title}
                        {s.optional ? (
                          <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 font-label text-[0.5625rem] uppercase tracking-[0.16em] text-charcoal-200">
                            Optional
                          </span>
                        ) : null}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-charcoal-400">
                        {s.detail}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal delay={0.1} className="mt-16 text-center">
          <Button asChild size="lg" className="group">
            <Link prefetch={false} href="/create">
              Start at step one
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
