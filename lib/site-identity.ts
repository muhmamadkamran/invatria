import { SITE_URL } from "./site";

/** Public identity: retain Invitra and associate the domain's spelling. */
export const SITE_IDENTITY_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Invitra",
    alternateName: ["Invatria", new URL(SITE_URL).hostname],
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#application` },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Invitra",
    alternateName: "Invatria",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon.svg`,
    description: "A free digital invitation card maker with customizable designs, shareable invitation links and online RSVP.",
  },
];
