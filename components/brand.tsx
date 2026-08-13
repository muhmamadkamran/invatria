import { cn } from "@/lib/utils";

/** The Invitra mark: a wax seal, pressed with a serif I.
 *  Drawn rather than imported so it stays crisp at every size. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-9", className)}
      role="img"
      aria-label="Invitra"
    >
      <defs>
        <linearGradient id="invitra-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9b7a14" />
          <stop offset="35%" stopColor="#d9bc57" />
          <stop offset="55%" stopColor="#f4e6b6" />
          <stop offset="78%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#8a6a10" />
        </linearGradient>
      </defs>

      {/* seal body with a hand-pressed, slightly irregular edge */}
      <path
        d="M20 2.4c2.9 0 4.1 2.3 6.7 3.1 2.6.8 5-.4 6.7 1.7 1.7 2.1.4 4.4 1.1 7 .7 2.6 3 3.9 3 6.8s-2.3 4.2-3 6.8c-.7 2.6.6 4.9-1.1 7-1.7 2.1-4.1.9-6.7 1.7-2.6.8-3.8 3.1-6.7 3.1s-4.1-2.3-6.7-3.1c-2.6-.8-5 .4-6.7-1.7-1.7-2.1-.4-4.4-1.1-7C4.8 25.2 2.5 23.9 2.5 21s2.3-4.2 3-6.8c.7-2.6-.6-4.9 1.1-7C8.3 5.1 10.7 6.3 13.3 5.5 15.9 4.7 17.1 2.4 20 2.4Z"
        fill="url(#invitra-gold)"
      />
      {/* pressed inner ring */}
      <circle
        cx="20"
        cy="21"
        r="12.4"
        fill="none"
        stroke="#7d600f"
        strokeOpacity="0.45"
        strokeWidth="0.9"
      />
      {/* the I, with slab serifs */}
      <g fill="#5c4708" fillOpacity="0.82">
        <rect x="14.6" y="14.4" width="10.8" height="1.9" rx="0.95" />
        <rect x="18.6" y="15.6" width="2.8" height="10.8" rx="0.7" />
        <rect x="14.6" y="25.7" width="10.8" height="1.9" rx="0.95" />
      </g>
    </svg>
  );
}

export function Wordmark({
  className,
  showMark = true,
}: {
  className?: string;
  showMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark ? <Logo className="size-8" /> : null}
      <span className="font-display text-[1.6rem] font-medium leading-none tracking-[0.02em] text-[var(--color-heading)]">
        Invitra
      </span>
    </span>
  );
}
