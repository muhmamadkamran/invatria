import { CATEGORIES } from "@/lib/categories";

/** A slow ticker of occasions — sets expectations before the features do. */
export function OccasionMarquee() {
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <div className="relative border-y border-[var(--color-line)] bg-[var(--color-surface-sunken)]/60 py-5">
      <div className="mask-fade-x flex overflow-hidden">
        <ul
          aria-hidden
          className="animate-marquee flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
          style={{ ["--duration" as string]: "58s" }}
        >
          {items.map((c, i) => (
            <li
              key={`${c.id}-${i}`}
              className="flex shrink-0 items-center gap-10 font-display text-lg font-light italic text-charcoal-400 sm:gap-14 sm:text-xl"
            >
              {c.label}
              <span className="size-1 rotate-45 bg-gold/50" />
            </li>
          ))}
        </ul>
      </div>
      {/* screen readers get the plain list once, not the duplicated ticker */}
      <p className="sr-only">
        Templates for {CATEGORIES.map((c) => c.label).join(", ")}.
      </p>
    </div>
  );
}
