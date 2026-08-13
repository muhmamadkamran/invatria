import type { CategoryId, TemplateId } from "./types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  blurb: string;
  icon: string;
  /** Template we pre-select when someone starts from this category. */
  suggested: TemplateId;
  /** Two-stop gradient used on the category tile. */
  from: string;
  to: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "wedding",
    label: "Wedding",
    blurb: "The whole day, from first look to last dance.",
    icon: "gem",
    suggested: "royal-gold",
    from: "#f6e7d8",
    to: "#e8cfae",
  },
  {
    id: "engagement",
    label: "Engagement",
    blurb: "Announce the yes with something worth keeping.",
    icon: "diamond",
    suggested: "romantic-blush",
    from: "#fbe4de",
    to: "#f2c9c9",
  },
  {
    id: "birthday",
    label: "Birthday",
    blurb: "From first candles to milestone years.",
    icon: "cake",
    suggested: "romantic-blush",
    from: "#fde8ef",
    to: "#f7d2e2",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    blurb: "A quiet celebration of the years so far.",
    icon: "heart-handshake",
    suggested: "modern-luxury",
    from: "#f4ece0",
    to: "#e6d5ba",
  },
  {
    id: "baby-shower",
    label: "Baby Shower",
    blurb: "Soft, warm and full of anticipation.",
    icon: "baby",
    suggested: "floral-paradise",
    from: "#eaf3ec",
    to: "#d9e8dd",
  },
  {
    id: "bridal-shower",
    label: "Bridal Shower",
    blurb: "Flowers, friends and an afternoon of it.",
    icon: "flower",
    suggested: "floral-paradise",
    from: "#f2ecfa",
    to: "#e2d7f2",
  },
  {
    id: "graduation",
    label: "Graduation",
    blurb: "Mark the finish line properly.",
    icon: "graduation-cap",
    suggested: "moonlight-garden",
    from: "#e6ebf6",
    to: "#ccd8ee",
  },
  {
    id: "corporate",
    label: "Corporate Events",
    blurb: "Polished invitations that respect the calendar.",
    icon: "building",
    suggested: "modern-luxury",
    from: "#eeeae4",
    to: "#ddd5c8",
  },
  {
    id: "ramadan",
    label: "Ramadan",
    blurb: "Iftar gatherings and evenings of reflection.",
    icon: "moon-star",
    suggested: "royal-mughal",
    from: "#e7edeb",
    to: "#cddedb",
  },
  {
    id: "eid",
    label: "Eid",
    blurb: "Open the house and say come over.",
    icon: "sparkles",
    suggested: "royal-mughal",
    from: "#f6ebd9",
    to: "#ecd7ae",
  },
  {
    id: "nikah",
    label: "Nikah",
    blurb: "The ceremony itself, told with reverence.",
    icon: "heart",
    suggested: "royal-mughal",
    from: "#f7e9e6",
    to: "#eed2cd",
  },
  {
    id: "mehndi",
    label: "Mehndi",
    blurb: "Colour, music and henna until late.",
    icon: "hand",
    suggested: "royal-mughal",
    from: "#f9ecd6",
    to: "#f0d5a6",
  },
  {
    id: "walima",
    label: "Walima",
    blurb: "The reception dinner, done with grandeur.",
    icon: "utensils",
    suggested: "royal-gold",
    from: "#f2e6d3",
    to: "#e2c9a1",
  },
  {
    id: "reception",
    label: "Reception",
    blurb: "Doors open, everyone's invited.",
    icon: "party-popper",
    suggested: "moonlight-garden",
    from: "#eae6f4",
    to: "#d6cfe9",
  },
  {
    id: "house-warming",
    label: "House Warming",
    blurb: "New keys, first gathering.",
    icon: "house",
    suggested: "floral-paradise",
    from: "#eff2e8",
    to: "#dde5d1",
  },
  {
    id: "farewell",
    label: "Farewell",
    blurb: "A proper send-off, not a group chat.",
    icon: "plane",
    suggested: "modern-luxury",
    from: "#e9edf0",
    to: "#d5dde3",
  },
  {
    id: "school",
    label: "School Events",
    blurb: "Concerts, sports days and prize-givings.",
    icon: "school",
    suggested: "floral-paradise",
    from: "#eaf1f6",
    to: "#d3e3ef",
  },
  {
    id: "business",
    label: "Business Invitations",
    blurb: "Launches, openings and annual dinners.",
    icon: "briefcase",
    suggested: "modern-luxury",
    from: "#edeae6",
    to: "#dad3c9",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export function getCategory(id: CategoryId | string | undefined): CategoryDef {
  return CATEGORY_MAP[id as CategoryId] ?? CATEGORIES[0];
}
