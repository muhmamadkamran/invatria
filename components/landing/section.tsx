import { Reveal, RevealWords } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  italic,
  lead,
  align = "center",
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  /** Trailing words set in italic serif — the house style for section titles. */
  italic?: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
      ) : null}

      <h2 id={id} className="mt-4 text-display font-light">
        <RevealWords text={title} />
        {italic ? (
          <>
            {" "}
            <span className="italic text-gilt animate-sheen">
              <RevealWords text={italic} delay={0.1} />
            </span>
          </>
        ) : null}
      </h2>

      {lead ? (
        <Reveal delay={0.12}>
          <p
            className={cn(
              "mt-5 text-pretty text-[0.975rem] leading-relaxed text-charcoal-400",
              align === "center" && "mx-auto",
            )}
          >
            {lead}
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.2}>
        <div
          className={cn(
            "rule-gold mt-8 w-24",
            align === "center" && "mx-auto",
          )}
        />
      </Reveal>
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  id?: string;
  tone?: "default" | "sunken" | "ink";
}) {
  return (
    <section
      id={id}
      className={cn(
        "paper relative overflow-hidden py-24 sm:py-32",
        tone === "sunken" && "bg-[var(--color-surface-sunken)]",
        tone === "ink" && "bg-charcoal text-cream",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "relative mx-auto px-5 sm:px-8",
        size === "wide" && "max-w-[90rem]",
        size === "default" && "max-w-[80rem]",
        size === "narrow" && "max-w-[52rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
