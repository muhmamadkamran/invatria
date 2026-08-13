"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Section, Container } from "./section";
import { Button } from "@/components/ui/button";
import { Reveal, RevealWords } from "@/components/reveal";
import { GoldDust } from "@/components/fx";

const INCLUDED = [
  "Every template",
  "Every feature",
  "Unlimited invitations",
  "Unlimited guests",
  "RSVP + guest book",
  "Music, video, gallery",
  "QR code + custom link",
  "Image + PDF export",
];

const NEVER = [
  "A pricing page",
  "A subscription",
  "A trial that expires",
  "A watermark",
  "A guest limit",
  "A payment form",
];

export function FreeForever() {
  return (
    <Section tone="ink" className="text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,162,39,0.18), transparent 62%)",
        }}
      />
      <GoldDust count={30} />

      <Container size="narrow" className="text-center">
        <Reveal>
          <p className="eyebrow !text-gold-light">
            The business model, in full
          </p>
        </Reveal>

        <h2 className="mt-6 text-display font-light text-ivory">
          <RevealWords text="It costs" />{" "}
          <span className="italic text-gilt animate-sheen">
            <RevealWords text="nothing." delay={0.1} />
          </span>
          <br />
          <RevealWords text="That is the whole sentence." delay={0.2} />
        </h2>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-[0.975rem] leading-relaxed text-cream/70">
            Invitra makes money from a small number of clearly-labelled ads on
            the pages you build in — never on the invitation your guests open,
            never over content, never above the fold. That’s it. There is no
            upgrade to sell you, because there is nothing held back.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 text-left sm:grid-cols-2">
          <Reveal duration={0.8} className="glass-dark rounded-[1.5rem] p-7">
            <p className="font-label text-[0.625rem] uppercase tracking-[0.26em] text-gold-light">
              What you get
            </p>
            <p className="mt-3 font-display text-5xl font-light text-ivory">
              Free<span className="text-gold">.</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {INCLUDED.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-cream/80"
                >
                  <Check
                    className="size-3.5 shrink-0 text-gold"
                    strokeWidth={2}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={0.1}
            duration={0.8}
            className="rounded-[1.5rem] border border-white/10 p-7"
          >
            <p className="font-label text-[0.625rem] uppercase tracking-[0.26em] text-cream/50">
              What you’ll never see
            </p>
            <p className="mt-3 font-display text-5xl font-light text-cream/45">
              None<span className="text-cream/25">.</span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {NEVER.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-cream/55"
                >
                  <X
                    className="size-3.5 shrink-0 text-cream/30"
                    strokeWidth={2}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-12">
          <Button asChild size="lg" variant="gold">
            <Link href="/create">Create your invitation</Link>
          </Button>
          <p className="mt-4 text-xs text-cream/40">
            No sign-up. Your work saves to this device the moment you start
            typing.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
