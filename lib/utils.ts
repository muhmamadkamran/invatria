import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

/** A real UUID, because invitation ids are a `uuid` primary key in Postgres.
 *  Anything else is rejected by the database on write. */
export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for the odd environment without the Web Crypto API.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** The default public slug: short and typeable, not a 36-character UUID. */
export function shortSlug(): string {
  return newId().replace(/-/g, "").slice(0, 12);
}

/** Short opaque id for items nested inside the invitation document. */
export function uid(prefix = "") {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}${rand}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

/** Combine a `yyyy-mm-dd` date and `HH:mm` time into a Date in local time. */
export function toDateTime(date: string, time: string): Date | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh = 0, mm = 0] = (time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function formatLongDate(date: string) {
  const dt = toDateTime(date, "00:00");
  if (!dt) return "";
  return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateParts(date: string) {
  const dt = toDateTime(date, "00:00");
  if (!dt) return { day: "--", month: "", weekday: "", year: "" };
  return {
    day: String(dt.getDate()).padStart(2, "0"),
    month: MONTHS[dt.getMonth()],
    monthShort: MONTHS[dt.getMonth()].slice(0, 3),
    weekday: DAYS[dt.getDay()],
    year: String(dt.getFullYear()),
  };
}

export function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

/** Deterministic pseudo-random in [0,1) from an integer seed — lets particle
 *  fields render identically on server and client, avoiding hydration drift. */
export function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/** Build a Google Maps directions URL from a free-text address. */
export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Accepts a full maps URL or a plain address and always returns a usable link. */
export function resolveMapsUrl(mapsUrl: string, address: string) {
  const trimmed = mapsUrl?.trim();
  if (trimmed && /^https?:\/\//i.test(trimmed)) return trimmed;
  if (address?.trim()) return mapsSearchUrl(address);
  return "";
}

/** A Google Calendar "add event" link. */
export function calendarUrl(opts: {
  title: string;
  start: Date | null;
  end?: Date | null;
  details?: string;
  location?: string;
}) {
  if (!opts.start) return "";
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = opts.end ?? new Date(opts.start.getTime() + 3 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
