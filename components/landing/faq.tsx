"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section, Container, SectionHeading } from "./section";
import { cn } from "@/lib/utils";

const QA = [
  {
    q: "Is it genuinely free, or free until I try to send it?",
    a: "Genuinely free. There is no plan, no trial, no watermark and no guest limit anywhere in the product. The invitation you publish is the finished thing. Advertising on the studio pages pays for it.",
  },
  {
    q: "Do I need an account?",
    a: "You can browse designs and sample invitation previews before signing in. To create your own invitation, save your work, upload photos or music, and publish a shareable link, create a free account or sign in. Guests can open your published link and reply without an account.",
  },
  {
    q: "Where do my photos and music go?",
    a: "After you sign in, uploads are stored in the cloud with your invitation. Your published invitation loads those photos and music for guests on other devices. Drafts, uploads, RSVPs and guest-book messages are saved to your account rather than your browser.",
  },
  {
    q: "Can guests reply without downloading anything?",
    a: "Yes. RSVP and the guest book are part of the invitation page itself. Guests tap the link, read it, reply, and that's the whole interaction.",
  },
  {
    q: "Will it work on an old phone?",
    a: "It's built mobile-first and renders statically, so it opens fast on modest hardware and slow connections. Animations respect the system reduced-motion setting and switch off cleanly when asked.",
  },
  {
    q: "Can I write the invitation in Urdu or Arabic?",
    a: "Yes — seven languages ship with the product, and Urdu and Arabic switch the whole invitation to right-to-left with the correct typeface. You can also type any language you like into the fields directly.",
  },
  {
    q: "Can I print it?",
    a: "Download it as a high-resolution image or a print-ready PDF, and add the QR code so the printed card still opens the live page with the countdown and RSVP on it.",
  },
  {
    q: "What happens to the invitation after the event?",
    a: "It stays exactly where it is, with the guest book messages attached, for as long as you keep it. Nothing expires and nothing is deleted on a schedule.",
  },
];

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
          {QA.map((item, i) => {
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
