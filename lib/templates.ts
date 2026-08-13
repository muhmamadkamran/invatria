import type { CategoryId, TemplateId } from "./types";

export type FxId =
  | "gold-dust"
  | "candles"
  | "petals"
  | "hearts"
  | "stars"
  | "fairy-lights"
  | "leaves"
  | "butterflies"
  | "orbs"
  | "lanterns";

export type OrnamentId = "crest" | "floral" | "moon" | "leaf" | "line" | "arch";

export interface TemplateTheme {
  /** Page canvas */
  bg: string;
  bgAlt: string;
  /** Elevated card surfaces */
  surface: string;
  /** Text */
  ink: string;
  inkSoft: string;
  /** Primary metal / accent */
  accent: string;
  accentSoft: string;
  accentDeep: string;
  /** Secondary accent used for pattern work and detail */
  second: string;
  line: string;
  /** Envelope */
  envelope: string;
  envelopeFlap: string;
  envelopeLiner: string;
  seal: string;
  sealInk: string;
}

export interface TemplateDef {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  /** True when the canvas is dark — the renderer flips contrast helpers. */
  dark: boolean;
  theme: TemplateTheme;
  fonts: {
    display: string;
    script: string;
    body: string;
    label: string;
  };
  fx: FxId[];
  ornament: OrnamentId;
  pattern: "none" | "damask" | "petals" | "stars" | "botanical" | "grid" | "geometric";
  features: string[];
  bestFor: CategoryId[];
  bestForLabel: string[];
  /** Swatches shown on the template card */
  swatches: string[];
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "royal-gold",
    name: "Royal Gold",
    tagline: "Black velvet and gold leaf",
    description:
      "A palace after dark. Gold-foil borders catch the light, candles breathe at the edges of the frame, and every rule is drawn in 24-carat hairline.",
    dark: true,
    theme: {
      bg: "#0b0906",
      bgAlt: "#120e08",
      surface: "#17120a",
      ink: "#f6ecd5",
      inkSoft: "#c4b391",
      accent: "#d4af37",
      accentSoft: "#f0dda0",
      accentDeep: "#8f6f16",
      second: "#7a5c12",
      line: "#3a2e14",
      envelope: "#211a10",
      envelopeFlap: "#2c2416",
      envelopeLiner: "#3a2f1b",
      seal: "#c9a227",
      sealInk: "#2a1f06",
    },
    fonts: {
      display: "var(--font-cinzel)",
      script: "var(--font-script)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["gold-dust", "candles"],
    ornament: "crest",
    pattern: "damask",
    features: [
      "Gold foil borders",
      "Candle flame animation",
      "Royal display type",
      "Wax-sealed envelope",
      "Drifting gold dust",
      "Damask palace pattern",
    ],
    bestFor: [
      "wedding", "walima", "reception", "nikah", "engagement", "anniversary",
      "corporate", "business", "eid", "ramadan", "birthday", "graduation", "farewell",
    ],
    bestForLabel: ["Royal Weddings", "Walima", "Reception"],
    swatches: ["#0b0906", "#d4af37", "#f0dda0", "#8f6f16"],
  },
  {
    id: "romantic-blush",
    name: "Romantic Blush",
    tagline: "Soft pink and rose gold",
    description:
      "Petals fall across warm blush paper. Rose-gold script, hand-drawn florals and gradients that feel like early evening light through a window.",
    dark: false,
    theme: {
      bg: "#fff8f6",
      bgAlt: "#fdeeea",
      surface: "#fffbfa",
      ink: "#4a352f",
      inkSoft: "#8a6c63",
      accent: "#c98b7a",
      accentSoft: "#e9c0b5",
      accentDeep: "#a5675a",
      second: "#d9a3a9",
      line: "#f0d8d1",
      envelope: "#f7ded7",
      envelopeFlap: "#f2cec5",
      envelopeLiner: "#fdf3f0",
      seal: "#c98b7a",
      sealInk: "#fff4f0",
    },
    fonts: {
      display: "var(--font-display)",
      script: "var(--font-script)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["petals", "hearts"],
    ornament: "floral",
    pattern: "petals",
    features: [
      "Falling rose petals",
      "Drifting hearts",
      "Rose-gold script",
      "Soft blush gradients",
      "Botanical dividers",
      "Elegant serif pairing",
    ],
    bestFor: [
      "engagement", "nikah", "anniversary", "bridal-shower", "birthday",
      "baby-shower", "wedding", "mehndi", "house-warming", "farewell",
    ],
    bestForLabel: ["Engagement", "Nikah", "Anniversary"],
    swatches: ["#fff8f6", "#c98b7a", "#e9c0b5", "#d9a3a9"],
  },
  {
    id: "moonlight-garden",
    name: "Moonlight Garden",
    tagline: "Navy, silver and starlight",
    description:
      "A garden at midnight. A slow-rising moon, constellations that twinkle out of sync, and fairy lights strung across the top of every section.",
    dark: true,
    theme: {
      bg: "#0c1226",
      bgAlt: "#111a36",
      surface: "#14203f",
      ink: "#e6edfb",
      inkSoft: "#a8b8d6",
      accent: "#c8d4e8",
      accentSoft: "#f0f5ff",
      accentDeep: "#7f93b8",
      second: "#8fa9d8",
      line: "#26355c",
      envelope: "#1c2950",
      envelopeFlap: "#26365f",
      envelopeLiner: "#2f4275",
      seal: "#c8d4e8",
      sealInk: "#131c33",
    },
    fonts: {
      display: "var(--font-serif)",
      script: "var(--font-script)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["stars", "fairy-lights"],
    ornament: "moon",
    pattern: "stars",
    features: [
      "Twinkling constellations",
      "Rising moon",
      "Strung fairy lights",
      "Silver foil accents",
      "Night-garden gradients",
      "Sparkle trails",
    ],
    bestFor: [
      "wedding", "reception", "engagement", "graduation", "birthday",
      "anniversary", "corporate", "business", "school", "farewell", "ramadan", "eid",
    ],
    bestForLabel: ["Evening Weddings", "Reception"],
    swatches: ["#0c1226", "#c8d4e8", "#8fa9d8", "#f0f5ff"],
  },
  {
    id: "floral-paradise",
    name: "Floral Paradise",
    tagline: "White, green and lavender",
    description:
      "Watercolour botanicals on cold-press paper. Leaves drift down the page, butterflies cross it slowly, and nothing is louder than it needs to be.",
    dark: false,
    theme: {
      bg: "#fbfcf8",
      bgAlt: "#f1f5ec",
      surface: "#ffffff",
      ink: "#2f3b2c",
      inkSoft: "#68765f",
      accent: "#7d9b6f",
      accentSoft: "#c3d6b8",
      accentDeep: "#4f6b45",
      second: "#b9a7cf",
      line: "#e0e7d8",
      envelope: "#eef3e8",
      envelopeFlap: "#e3ebda",
      envelopeLiner: "#f7f9f4",
      seal: "#7d9b6f",
      sealInk: "#f5f9f2",
    },
    fonts: {
      display: "var(--font-display)",
      script: "var(--font-script)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["leaves", "butterflies"],
    ornament: "leaf",
    pattern: "botanical",
    features: [
      "Watercolour florals",
      "Drifting leaves",
      "Crossing butterflies",
      "Lavender accents",
      "Natural paper texture",
      "Airy editorial layout",
    ],
    bestFor: [
      "wedding", "bridal-shower", "baby-shower", "house-warming", "school",
      "birthday", "engagement", "anniversary", "graduation", "farewell", "mehndi",
    ],
    bestForLabel: ["Garden Weddings", "Bridal Shower", "Baby Shower"],
    swatches: ["#fbfcf8", "#7d9b6f", "#b9a7cf", "#c3d6b8"],
  },
  {
    id: "modern-luxury",
    name: "Modern Luxury",
    tagline: "White, beige and gold",
    description:
      "Glass panels floating over warm beige. Generous whitespace, one hairline of gold per section, and motion so smooth you notice the content instead.",
    dark: false,
    theme: {
      bg: "#f9f6f1",
      bgAlt: "#f2ece2",
      surface: "#ffffff",
      ink: "#2b2724",
      inkSoft: "#6f665d",
      accent: "#b9985a",
      accentSoft: "#e3d2ae",
      accentDeep: "#8a6d34",
      second: "#c9c0b2",
      line: "#e8e0d3",
      envelope: "#efe8dc",
      envelopeFlap: "#e6ddcd",
      envelopeLiner: "#faf7f1",
      seal: "#b9985a",
      sealInk: "#fdfaf4",
    },
    fonts: {
      display: "var(--font-serif)",
      script: "var(--font-display)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["orbs"],
    ornament: "line",
    pattern: "grid",
    features: [
      "Glassmorphic panels",
      "Soft blur gradients",
      "Minimal editorial grid",
      "Hairline gold rules",
      "Restrained motion",
      "Corporate-ready layout",
    ],
    bestFor: [
      "corporate", "business", "wedding", "graduation", "farewell", "school",
      "anniversary", "reception", "house-warming", "birthday", "walima",
      "baby-shower", "bridal-shower",
    ],
    bestForLabel: ["Corporate Events", "Modern Weddings"],
    swatches: ["#f9f6f1", "#b9985a", "#e3d2ae", "#2b2724"],
  },
  {
    id: "royal-mughal",
    name: "Royal Mughal",
    tagline: "Maroon, emerald and antique gold",
    description:
      "Scalloped Mughal arches, geometric jali screens and hanging lanterns that sway. Built for mehndi, nikah and walima, with Arabic type support throughout.",
    dark: true,
    theme: {
      bg: "#3a0f18",
      bgAlt: "#4a1420",
      surface: "#48151f",
      ink: "#f7e8cd",
      inkSoft: "#d3b48c",
      accent: "#c8a668",
      accentSoft: "#e8d3a4",
      accentDeep: "#8d6f36",
      second: "#10513f",
      line: "#6b3038",
      envelope: "#5a1c28",
      envelopeFlap: "#6b2433",
      envelopeLiner: "#10513f",
      seal: "#c8a668",
      sealInk: "#3a0f18",
    },
    fonts: {
      display: "var(--font-amiri)",
      script: "var(--font-script)",
      body: "var(--font-sans)",
      label: "var(--font-label)",
    },
    fx: ["lanterns", "gold-dust"],
    ornament: "arch",
    pattern: "geometric",
    features: [
      "Scalloped Mughal arches",
      "Islamic jali geometry",
      "Swaying lanterns",
      "Antique gold motifs",
      "Emerald inlay detail",
      "Arabic type support",
    ],
    bestFor: [
      "mehndi", "nikah", "walima", "wedding", "eid", "ramadan",
      "reception", "engagement", "anniversary",
    ],
    bestForLabel: ["Mehndi", "Nikah", "Traditional Weddings"],
    swatches: ["#3a0f18", "#c8a668", "#10513f", "#e8d3a4"],
  },
];

export const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, TemplateDef>;

export function getTemplate(id: TemplateId | string | undefined): TemplateDef {
  return TEMPLATE_MAP[id as TemplateId] ?? TEMPLATES[0];
}

/** Theme values as CSS custom properties, applied to an invitation's root node. */
export function themeVars(t: TemplateDef): React.CSSProperties {
  const { theme, fonts } = t;
  return {
    "--t-bg": theme.bg,
    "--t-bg-alt": theme.bgAlt,
    "--t-surface": theme.surface,
    "--t-ink": theme.ink,
    "--t-ink-soft": theme.inkSoft,
    "--t-accent": theme.accent,
    "--t-accent-soft": theme.accentSoft,
    "--t-accent-deep": theme.accentDeep,
    "--t-second": theme.second,
    "--t-line": theme.line,
    "--t-envelope": theme.envelope,
    "--t-envelope-flap": theme.envelopeFlap,
    "--t-envelope-liner": theme.envelopeLiner,
    "--t-seal": theme.seal,
    "--t-seal-ink": theme.sealInk,
    "--t-display": fonts.display,
    "--t-script": fonts.script,
    "--t-body": fonts.body,
    "--t-label": fonts.label,
  } as React.CSSProperties;
}
