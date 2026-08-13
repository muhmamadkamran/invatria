"use client";

import { useId } from "react";
import type { TemplateDef } from "@/lib/templates";
import { cn } from "@/lib/utils";

/** Every template gets a drawn motif rather than a stock texture, so the
 *  background scales cleanly and re-colours from the theme. */
export function Pattern({
  template,
  className,
  opacity = 0.07,
  scale = 1,
}: {
  template: TemplateDef;
  className?: string;
  opacity?: number;
  scale?: number;
}) {
  const id = useId().replace(/:/g, "");
  const { pattern, theme } = template;
  if (pattern === "none") return null;

  const stroke = theme.accent;

  const tiles: Record<string, { size: number; content: React.ReactNode }> = {
    damask: {
      size: 80,
      content: (
        <g fill="none" stroke={stroke} strokeWidth="1">
          <path d="M40 8c9 8 14 16 14 24s-5 16-14 24c-9-8-14-16-14-24S31 16 40 8Z" />
          <path d="M40 20c4 5 6 9 6 12s-2 7-6 12c-4-5-6-9-6-12s2-7 6-12Z" />
          <circle cx="40" cy="32" r="2.4" fill={stroke} stroke="none" />
          <path d="M8 40c8-6 14-6 18-2M72 40c-8-6-14-6-18-2" />
          <path d="M0 0c6 8 12 10 18 8M80 0c-6 8-12 10-18 8M0 80c6-8 12-10 18-8M80 80c-6-8-12-10-18-8" />
        </g>
      ),
    },
    petals: {
      size: 72,
      content: (
        <g fill={stroke} opacity="0.85">
          <path d="M18 10c5 3 8 7 8 11s-3 8-8 12c-5-4-8-8-8-12s3-8 8-11Z" />
          <path d="M52 40c5 3 8 7 8 11s-3 8-8 12c-5-4-8-8-8-12s3-8 8-11Z" transform="rotate(38 52 51)" />
          <circle cx="60" cy="16" r="2" />
          <circle cx="12" cy="54" r="2" />
        </g>
      ),
    },
    stars: {
      size: 64,
      content: (
        <g fill={stroke}>
          <path d="M16 4 17.6 12.4 26 14 17.6 15.6 16 24 14.4 15.6 6 14 14.4 12.4Z" opacity="0.9" />
          <path d="M48 34 49.1 40 55 41 49.1 42 48 48 46.9 42 41 41 46.9 40Z" opacity="0.7" />
          <circle cx="34" cy="12" r="1.1" />
          <circle cx="8" cy="46" r="1.1" />
          <circle cx="58" cy="18" r="0.9" />
        </g>
      ),
    },
    botanical: {
      size: 88,
      content: (
        <g fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round">
          <path d="M14 76C14 54 22 38 40 26" />
          <path d="M22 60c-6-2-9-7-9-13 7 0 12 4 13 10M30 46c-6-3-8-8-7-14 7 1 11 6 11 12M36 34c-5-4-6-9-4-14 6 2 9 7 9 13" />
          <path d="M62 12c0 18-6 30-18 40" />
          <path d="M56 28c5-2 8-6 8-11-6 0-10 3-11 8" />
          <circle cx="72" cy="62" r="3" />
          <circle cx="80" cy="70" r="2" />
        </g>
      ),
    },
    grid: {
      size: 56,
      content: (
        <g stroke={stroke} strokeWidth="0.75">
          <path d="M0 0h56M0 0v56" />
          <circle cx="28" cy="28" r="1.1" fill={stroke} stroke="none" />
        </g>
      ),
    },
    /* Eight-point star tessellation — the jali screen of the Mughal template */
    geometric: {
      size: 72,
      content: (
        <g fill="none" stroke={stroke} strokeWidth="1">
          <path d="M36 6 44 14h12v12l8 8-8 8v12H44l-8 8-8-8H16V42l-8-8 8-8V14h12Z" />
          <path d="M36 14 30 20h-8v8l-6 6 6 6v8h8l6 6 6-6h8v-8l6-6-6-6v-8h-8Z" />
          <circle cx="36" cy="34" r="3.4" />
          <path d="M0 34h8M64 34h8M36 0v6M36 62v10" />
        </g>
      ),
    },
  };

  const tile = tiles[pattern];
  if (!tile) return null;

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={id}
          width={tile.size * scale}
          height={tile.size * scale}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          {tile.content}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ============================================================================
   Section ornaments — the little dividers that give each theme its handwriting
   ========================================================================= */

export function Ornament({
  template,
  className,
  width = 220,
}: {
  template: TemplateDef;
  className?: string;
  width?: number;
}) {
  const c = template.theme.accent;
  const common = { fill: "none", stroke: c, strokeWidth: 1, strokeLinecap: "round" as const };

  const art: Record<string, React.ReactNode> = {
    crest: (
      <g {...common}>
        <path d="M10 12h74M136 12h74" />
        <path d="M110 2c7 5 11 9 11 13s-4 8-11 13c-7-5-11-9-11-13s4-8 11-13Z" />
        <path d="M110 8c3 3 4 5 4 7s-1 4-4 7c-3-3-4-5-4-7s1-4 4-7Z" />
        <path d="M92 12c-4-4-8-5-11-3M128 12c4-4 8-5 11-3" />
        <circle cx="88" cy="12" r="1.6" fill={c} />
        <circle cx="132" cy="12" r="1.6" fill={c} />
      </g>
    ),
    floral: (
      <g {...common}>
        <path d="M16 12h72M132 12h72" />
        <path d="M110 4c4 3 6 6 6 8s-2 5-6 8c-4-3-6-6-6-8s2-5 6-8Z" fill={c} fillOpacity="0.16" />
        <path d="M100 12c-4-5-9-6-13-4 1 5 5 8 10 8M120 12c4-5 9-6 13-4-1 5-5 8-10 8" />
      </g>
    ),
    moon: (
      <g {...common}>
        <path d="M14 12h78M128 12h78" />
        <path d="M116 4a8.5 8.5 0 1 0 0 16 10 10 0 0 1 0-16Z" fill={c} fillOpacity="0.35" />
        <path d="M100 6l1.2 3.6L105 11l-3.8 1.4L100 16l-1.2-3.6L95 11l3.8-1.4Z" fill={c} stroke="none" />
        <path d="M128 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9Z" fill={c} stroke="none" />
      </g>
    ),
    leaf: (
      <g {...common}>
        <path d="M12 12h84M124 12h84" />
        <path d="M110 3c7 4 10 7 10 9s-3 5-10 9c-7-4-10-7-10-9s3-5 10-9Z" fill={c} fillOpacity="0.14" />
        <path d="M110 3v18" />
      </g>
    ),
    line: (
      <g {...common}>
        <path d="M0 12h96M124 12h96" />
        <path d="M110 6v12M104 12h12" strokeWidth="0.9" />
      </g>
    ),
    arch: (
      <g {...common}>
        <path d="M8 12h72M140 12h72" />
        <path d="M110 22c-8 0-13-5-13-11 0-5 5-9 13-9s13 4 13 9c0 6-5 11-13 11Z" />
        <path d="M110 2v20M97 11h26" strokeWidth="0.7" strokeOpacity="0.6" />
        <circle cx="110" cy="11" r="2.6" fill={c} stroke="none" />
      </g>
    ),
  };

  return (
    <svg
      aria-hidden
      viewBox="0 0 220 24"
      width={width}
      className={cn("mx-auto block", className)}
      style={{ maxWidth: "100%" }}
    >
      {art[template.ornament] ?? art.line}
    </svg>
  );
}
