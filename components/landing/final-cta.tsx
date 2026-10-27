"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./section";
import { Button } from "@/components/ui/button";
import { Reveal, RevealWords } from "@/components/reveal";
import { Ornament } from "@/components/invitation/pattern";
import { TEMPLATES } from "@/lib/templates";

export function FinalCta() {
  return (
    <section className="paper relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_100%,var(--color-blush)_0%,var(--color-cream)_45%,var(--color-ivory)_80%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_100%,#2b2418_0%,#1e1a12_48%,var(--color-surface)_82%)]"
      />

      <Container size="narrow" className="text-center">
        <Ornament template={TEMPLATES[4]} width={200} className="opacity-60" />

        <h2 className="mt-8 text-display font-light">
          <RevealWords text="Someone is waiting" />
          <br />
          <span className="italic text-rose-gilt animate-sheen">
            <RevealWords text="to be invited." delay={0.12} />
          </span>
        </h2>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-lg text-pretty text-[0.975rem] leading-relaxed text-charcoal-400">
            Pick a design, type two names and a date, and you’ll have something
            worth sending before the kettle boils.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group w-full sm:w-auto">
              <Link prefetch={false} href="/create">
                Create Invitation
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/demo">See a finished one</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
