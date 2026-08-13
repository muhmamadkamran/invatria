"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { Section, Container, SectionHeading } from "./section";
import { CATEGORIES } from "@/lib/categories";
import { Reveal } from "@/components/reveal";

export function Occasions() {
  return (
    <Section id="occasions">
      <Container>
        <SectionHeading
          eyebrow="Eighteen occasions"
          title="Whatever you're"
          italic="gathering people for"
          lead="Every category comes pre-set with the right sections, wording and design — a nikah invitation asks different questions than a product launch."
        />

        <ul className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <li key={c.id}>
              <Reveal
                delay={Math.min((i % 6) * 0.05 + Math.floor(i / 6) * 0.06, 0.5)}
                duration={0.7}
                className="h-full"
              >
                <Link
                  href={`/create?occasion=${c.id}&template=${c.suggested}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-5 transition-all duration-500 ease-[var(--ease-luxe)] hover:-translate-y-1 hover:border-gold/35 hover:shadow-[var(--shadow-lifted)]"
                >
                  {/* the tile's own colour, revealed on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-600 group-hover:opacity-100 dark:group-hover:opacity-25"
                    style={{
                      background: `linear-gradient(150deg, ${c.from}, ${c.to})`,
                    }}
                  />

                  <span
                    className="relative grid size-10 place-items-center rounded-xl transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:scale-105"
                    style={{
                      background: `linear-gradient(145deg, ${c.from}, ${c.to})`,
                    }}
                  >
                    <Icon
                      name={c.icon}
                      className="size-[1.05rem] text-charcoal-600"
                    />
                  </span>

                  <h3 className="relative mt-4 font-serif text-[0.9375rem] leading-tight text-[var(--color-heading)]">
                    {c.label}
                  </h3>
                  <p className="relative mt-1.5 text-[0.6875rem] leading-relaxed text-charcoal-400 transition-colors duration-500 group-hover:text-charcoal-600">
                    {c.blurb}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
