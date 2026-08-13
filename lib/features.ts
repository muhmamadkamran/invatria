export interface FeatureDef {
  title: string;
  detail: string;
  icon: string;
  group: "Create" | "Share" | "Host" | "Craft";
}

/** The 22 things every Invitra invitation can do — all free, none gated. */
export const FEATURES: FeatureDef[] = [
  {
    title: "Unlimited Invitations",
    detail: "Make one, make forty. There is no counter anywhere in this product.",
    icon: "infinity",
    group: "Create",
  },
  {
    title: "Unlimited Guests",
    detail: "Invite twelve people or twelve hundred. The price is identical.",
    icon: "users",
    group: "Share",
  },
  {
    title: "Unlimited Sharing",
    detail: "One link, any channel — WhatsApp, email, SMS, printed on the card.",
    icon: "share",
    group: "Share",
  },
  {
    title: "RSVP Management",
    detail: "Track attending, declined and maybes, with head counts and meals.",
    icon: "clipboard-check",
    group: "Host",
  },
  {
    title: "Countdown Timer",
    detail: "A live countdown to the hour, ticking down on every guest's screen.",
    icon: "timer",
    group: "Craft",
  },
  {
    title: "Google Maps",
    detail: "Drop a pin and guests get directions in one tap from their phone.",
    icon: "map-pin",
    group: "Host",
  },
  {
    title: "Gallery",
    detail: "A photo gallery with lightbox, captions and lazy-loaded images.",
    icon: "images",
    group: "Craft",
  },
  {
    title: "Music",
    detail: "Set a soundtrack. It fades in politely and never autoplays loudly.",
    icon: "music",
    group: "Craft",
  },
  {
    title: "Photo Upload",
    detail: "Upload covers and gallery photos straight from your camera roll.",
    icon: "upload",
    group: "Create",
  },
  {
    title: "Video Support",
    detail: "Embed a save-the-date film or a message to guests who can't travel.",
    icon: "video",
    group: "Craft",
  },
  {
    title: "QR Code",
    detail: "A scannable code for printed cards, table settings and posters.",
    icon: "qr-code",
    group: "Share",
  },
  {
    title: "Custom URL",
    detail: "Claim a link that reads like a name, not a string of characters.",
    icon: "link",
    group: "Share",
  },
  {
    title: "Multiple Languages",
    detail: "English, Urdu, Arabic, French, Spanish, Turkish and Indonesian.",
    icon: "languages",
    group: "Create",
  },
  {
    title: "Dark Mode",
    detail: "The whole studio, and every invitation, in a candlelit dark theme.",
    icon: "moon",
    group: "Craft",
  },
  {
    title: "Guest Messages",
    detail: "A guest book where people leave notes you keep long after the day.",
    icon: "message-circle",
    group: "Host",
  },
  {
    title: "Animations",
    detail: "Envelope reveals, wax seals and scroll motion tuned to the theme.",
    icon: "wand",
    group: "Craft",
  },
  {
    title: "Live Preview",
    detail: "The invitation renders as you type, on a real phone frame.",
    icon: "eye",
    group: "Create",
  },
  {
    title: "Download Image",
    detail: "Export a high-resolution PNG for stories, posts and print.",
    icon: "image-down",
    group: "Share",
  },
  {
    title: "Download PDF",
    detail: "A print-ready PDF card for guests who'd rather hold something.",
    icon: "file-down",
    group: "Share",
  },
  {
    title: "Mobile Friendly",
    detail: "Designed on a phone first, because that's where it will be opened.",
    icon: "smartphone",
    group: "Craft",
  },
  {
    title: "SEO Friendly",
    detail: "Clean metadata and previews, so shared links unfurl beautifully.",
    icon: "search",
    group: "Share",
  },
  {
    title: "Fast Loading",
    detail: "Static rendering and lazy media. It opens before they lose interest.",
    icon: "zap",
    group: "Craft",
  },
];

export const FEATURE_GROUPS = ["Create", "Craft", "Share", "Host"] as const;
