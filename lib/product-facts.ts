import { LANGUAGES } from "./i18n";
import { SITE_URL } from "./site";
import { TEMPLATES } from "./templates";

export const PRODUCT_SUMMARY = "Invitra is a free online invitation card maker for weddings, birthdays, baby showers, nikah ceremonies and other events. Hosts customize a design, publish an invitation link and collect guest RSVPs in their account.";

/** Visible product facts and machine-readable summaries use the same source. */
export const PRODUCT_FACTS = [
  { label: "Product", value: "Invitra, also known as Invatria" },
  { label: "Price", value: "Free to use. Advertising appears on the studio pages." },
  { label: "Host account", value: "A free account is required to save, upload media and publish an invitation." },
  { label: "Guest access", value: "Guests can open a published invitation and RSVP without creating an account or installing an app." },
  { label: "Designs", value: `${TEMPLATES.length} customizable templates: ${TEMPLATES.map(template => template.name).join(", ")}.` },
  { label: "Sharing", value: "Share a published link through WhatsApp, email or text message, or use the invitation's QR code." },
  { label: "Guest responses", value: "RSVP, guest counts, optional meal choices and guest-book messages." },
  { label: "Downloads", value: "Image and PDF exports." },
  { label: "Invitation languages", value: LANGUAGES.map(language => language.label).join(", ") + ". Urdu and Arabic support right-to-left layouts." },
];

export const PRODUCT_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#application`,
  name: "Invitra",
  alternateName: "Invatria",
  url: `${SITE_URL}/`,
  description: PRODUCT_SUMMARY,
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  inLanguage: LANGUAGES.map(language => language.code),
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Customizable invitation templates", "Online RSVP", "Guest counts", "Meal choices",
    "Event schedule", "Venue details", "Photo gallery", "Background music",
    "Countdown timer", "QR code", "Guest book", "Image and PDF export",
  ],
};
