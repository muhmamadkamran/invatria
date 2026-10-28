import type { Metadata } from "next";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE_IDENTITY_JSON_LD } from "@/lib/site-identity";
import { SOCIAL_IMAGE } from "@/lib/social-metadata";
import { PRODUCT_APPLICATION_JSON_LD } from "@/lib/product-facts";
export const metadata: Metadata = {
  title: { absolute: "Invitra — Free Online Invitation Card Maker with RSVP" },
  description: "Invitra, also known as Invatria, is a free online invitation card maker. Customize a design, share a link and collect RSVPs for weddings and birthdays.",
  openGraph: {
    title: "Free Online Invitation Card Maker with RSVP · Invitra",
    description: "Customize a free digital invitation card, share a link and collect guest RSVPs online.",
    url: "/",
    siteName: "Invitra",
    images: [SOCIAL_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: SOCIAL_IMAGE.url, alt: SOCIAL_IMAGE.alt }],
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...SITE_IDENTITY_JSON_LD, PRODUCT_APPLICATION_JSON_LD, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ_ITEMS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }]).replace(/</g, "\u003c") }}
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
