/* ============================================================================
   Invitra — domain types
   ========================================================================= */

export type TemplateId =
  | "royal-gold"
  | "romantic-blush"
  | "moonlight-garden"
  | "floral-paradise"
  | "modern-luxury"
  | "royal-mughal";

export type CategoryId =
  | "wedding"
  | "engagement"
  | "birthday"
  | "anniversary"
  | "baby-shower"
  | "bridal-shower"
  | "graduation"
  | "corporate"
  | "ramadan"
  | "eid"
  | "nikah"
  | "mehndi"
  | "walima"
  | "reception"
  | "house-warming"
  | "farewell"
  | "school"
  | "business";

export type LangCode = "en" | "ur" | "ar" | "fr" | "es" | "tr" | "id";

/** A stored media item.
 *
 *  `key`    — a Blob in IndexedDB (offline / unconfigured mode)
 *  `url`    — a public URL: Supabase Storage, or anything the user pasted
 *  `bucket` + `path` — where it lives in Supabase Storage, so it can be deleted
 *
 *  A ref carries `url` once uploaded; `key` is only used before that. */
export interface MediaRef {
  id: string;
  key?: string;
  url?: string;
  bucket?: string;
  path?: string;
  name?: string;
  caption?: string;
  width?: number;
  height?: number;
  kind: "image" | "audio" | "video";
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface StoryChapter {
  id: string;
  date: string;
  title: string;
  body: string;
  image?: MediaRef | null;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  note?: string;
  image?: MediaRef | null;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AccommodationItem {
  id: string;
  name: string;
  detail?: string;
  link?: string;
}

export interface Invitation {
  id: string;
  slug: string;
  templateId: TemplateId;
  category: CategoryId;
  language: LangCode;
  createdAt: number;
  updatedAt: number;
  published: boolean;

  /** Cover / hero */
  cover: MediaRef | null;
  coverFocus: { x: number; y: number };

  /** Who + what */
  eyebrow: string;
  hostPrimary: string;
  hostSecondary: string;
  joinWord: string;
  tagline: string;
  invitationNote: string;

  /** When */
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  endTime: string;
  timezone: string;

  /** Where */
  venueName: string;
  venueAddress: string;
  mapsUrl: string;

  /** Rich sections */
  gallery: MediaRef[];
  music: { source: MediaRef | null; title: string; autoplay: boolean };
  video: { url: string; title: string };
  timeline: TimelineItem[];
  dressCode: { title: string; description: string; palette: string[] };
  story: { enabled: boolean; heading: string; chapters: StoryChapter[] };
  parents: {
    enabled: boolean;
    heading: string;
    sideALabel: string;
    sideA: string[];
    sideBLabel: string;
    sideB: string[];
  };
  family: { enabled: boolean; heading: string; members: FamilyMember[] };
  gifts: { enabled: boolean; heading: string; message: string; details: string[] };
  travel: {
    enabled: boolean;
    transportation: string;
    accommodation: AccommodationItem[];
  };
  faqs: { enabled: boolean; items: FaqItem[] };
  rsvp: {
    enabled: boolean;
    heading: string;
    message: string;
    deadline: string;
    askGuestCount: boolean;
    maxGuests: number;
    askMeal: boolean;
    mealOptions: string[];
    askMessage: boolean;
  };
  guestbook: { enabled: boolean; heading: string; message: string };

  /** Presentation */
  options: {
    envelope: boolean;
    particles: boolean;
    countdown: boolean;
    qrCode: boolean;
    darkMode: boolean;
    accent?: string;
  };
}

export type RsvpStatus = "attending" | "not-attending" | "maybe";

export interface RsvpResponse {
  id: string;
  invitationId: string;
  name: string;
  email: string;
  status: RsvpStatus;
  guests: number;
  meal?: string;
  message?: string;
  createdAt: number;
}

export interface GuestMessage {
  id: string;
  invitationId: string;
  name: string;
  message: string;
  createdAt: number;
}
