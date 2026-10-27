import { Plus } from "lucide-react";
import { Section, Container, SectionHeading } from "./section";
import { FAQ_ITEMS } from "@/lib/faq";

export function Faq() {
  return (
    <Section id="faq">
      <Container size="narrow">
        <SectionHeading eyebrow="Questions" title="The things people" italic="ask first" />
        <div className="mt-14">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} name="home-faq" open={i === 0} className="group border-b border-[var(--color-line)] first:border-t">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-[1.0625rem] leading-snug text-[var(--color-heading)] group-open:text-gold-deep sm:text-[1.15rem] dark:group-open:text-gold-light">{item.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-charcoal-400 transition-transform group-open:rotate-[135deg] group-open:border-gold/60 group-open:bg-gold/10">
                  <Plus aria-hidden="true" className="size-3.5" strokeWidth={1.6} />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pr-12 text-[0.9375rem] leading-relaxed text-charcoal-400">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
