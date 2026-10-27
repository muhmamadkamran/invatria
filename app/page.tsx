import type { Metadata } from "next";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE_IDENTITY_JSON_LD } from "@/lib/site-identity";
export const metadata: Metadata = {
  title: { absolute: "Invitra — Free Online Invitation Card Maker with RSVP" },
  description: "Invitra, also known as Invatria, is a free online invitation card maker. Customize a design, share a link and collect RSVPs for weddings and birthdays.",
  openGraph: {
    title: "Free Online Invitation Card Maker with RSVP · Invitra",
    description: "Customize a free digital invitation card, share a link and collect guest RSVPs online.",
    url: "/",
    siteName: "Invitra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Invitation Card Maker with RSVP · Invitra",
    description: "Customize a free digital invitation card, share a link and collect guest RSVPs online.",
  },
  alternates: { canonical: "/" },
};
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ads";
import { Hero } from "@/components/landing/hero";
import { OccasionMarquee } from "@/components/landing/marquee";
import { Features } from "@/components/landing/features";
import { TemplatesShowcase } from "@/components/landing/templates-showcase";
import { Occasions } from "@/components/landing/occasions";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FreeForever } from "@/components/landing/free-forever";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Invitra",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  description:
    "Create free digital invitation cards for weddings, birthdays and other events, with shareable links and online RSVP.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Unlimited invitations",
    "Unlimited guests",
    "RSVP management",
    "Countdown timer",
    "Google Maps",
    "Photo gallery",
    "Background music",
    "QR code",
    "Custom URL",
    "Multiple languages",
    "Dark mode",
    "Image and PDF export",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...SITE_IDENTITY_JSON_LD, jsonLd, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ_ITEMS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }]).replace(/</g, "\u003c") }}
      />
      <SiteHeader />
      <main id="main">
        <Hero />
        <OccasionMarquee />
        <Features />

        {/* the only ad on the landing page, well below the fold */}
        <AdSlot slot="landing-mid" className="py-10" />

        <TemplatesShowcase />
        <Occasions />
        <HowItWorks />
        <FreeForever />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
