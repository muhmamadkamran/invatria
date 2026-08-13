export interface StepDef {
  n: number;
  key: string;
  title: string;
  detail: string;
  act: string;
  /** Steps that can be skipped entirely — the invitation still publishes. */
  optional?: boolean;
}

/** The fourteen steps of the builder, in order. The builder and the landing
 *  page read from this same list, so they can never drift apart. */
export const STEPS: StepDef[] = [
  {
    n: 1,
    key: "template",
    title: "Choose Template",
    detail: "Six complete design worlds. Change your mind at any point — nothing is lost.",
    act: "The design",
  },
  {
    n: 2,
    key: "cover",
    title: "Upload Cover Image",
    detail: "The photograph guests see first. Drag to set what stays in frame.",
    act: "The design",
    optional: true,
  },
  {
    n: 3,
    key: "names",
    title: "Names & Titles",
    detail:
      "Bride and groom, the birthday name, the graduate, the company — the fields change with the occasion you picked.",
    act: "The essentials",
  },
  {
    n: 4,
    key: "date",
    title: "Date",
    detail: "Sets the countdown and the add-to-calendar link automatically.",
    act: "The essentials",
  },
  {
    n: 5,
    key: "time",
    title: "Time",
    detail: "Start and finish, so nobody has to ask when carriages are.",
    act: "The essentials",
  },
  {
    n: 6,
    key: "venue",
    title: "Venue",
    detail: "Name and full address, formatted the way an invitation should be.",
    act: "The essentials",
  },
  {
    n: 7,
    key: "maps",
    title: "Google Maps Link",
    detail: "One tap to directions. Paste a link or let us build one from the address.",
    act: "The essentials",
    optional: true,
  },
  {
    n: 8,
    key: "gallery",
    title: "Gallery Images",
    detail: "A photo set with a lightbox. Add as many as you like — there's no cap.",
    act: "The atmosphere",
    optional: true,
  },
  {
    n: 9,
    key: "music",
    title: "Background Music",
    detail: "A track that fades in gently, with a control guests can always reach.",
    act: "The atmosphere",
    optional: true,
  },
  {
    n: 10,
    key: "timeline",
    title: "Timeline",
    detail: "The running order of the day, drawn as an illustrated schedule.",
    act: "The atmosphere",
    optional: true,
  },
  {
    n: 11,
    key: "details",
    title: "Dress Code",
    detail: "Plus story, family, gifts, travel and questions — every optional section.",
    act: "The atmosphere",
    optional: true,
  },
  {
    n: 12,
    key: "rsvp",
    title: "RSVP",
    detail: "Choose what to ask: head count, meal preference, a message.",
    act: "Going live",
  },
  {
    n: 13,
    key: "preview",
    title: "Preview",
    detail: "The finished invitation, on a real phone, exactly as guests will see it.",
    act: "Going live",
  },
  {
    n: 14,
    key: "publish",
    title: "Publish",
    detail: "Claim a link, get a QR code, download it as an image or a PDF. Done.",
    act: "Going live",
  },
];

export const ACTS = ["The design", "The essentials", "The atmosphere", "Going live"] as const;
