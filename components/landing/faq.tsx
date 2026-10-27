"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section, Container, SectionHeading } from "./section";
import { cn } from "@/lib/utils";

import { FAQ_ITEMS } from "@/lib/faq";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Questions"
          title="The things people"
          italic="ask first"
        />

        <ul className="mt-14">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-[var(--color-line)] first:border-t">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={cn(
                        "font-serif text-[1.0625rem] leading-snug transition-colors duration-400 sm:text-[1.15rem]",
                        isOpen ? "text-gold-deep dark:text-gold-light" : "text-[var(--color-heading)]",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-luxe)]",
                        isOpen
                          ? "rotate-[135deg] border-gold/60 bg-gold/10 text-gold-deep dark:text-gold-light"
                          : "border-[var(--color-line)] text-charcoal-400 group-hover:border-gold/40",
                      )}
                    >
                      <Plus className="size-3.5" strokeWidth={1.6} />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="panel"
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pr-12 text-[0.9375rem] leading-relaxed text-charcoal-400">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
