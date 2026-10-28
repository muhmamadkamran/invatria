import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL } from "@/lib/site";
import { PRODUCT_SUMMARY, PRODUCT_FACTS, PRODUCT_APPLICATION_JSON_LD } from "@/lib/product-facts";
import { socialMetadata } from "@/lib/social-metadata";

const title = "About Invitra";
const description = "Learn about Invitra, a free digital invitation studio with customizable templates, shareable event pages, online RSVPs and a guest book.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  ...socialMetadata(title, description, "/about"),
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Breadcrumbs items={[{ name: "About Invitra", path: "/about" }]} />
        <article className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <p className="eyebrow">Publisher profile</p>
          <h1 className="mt-4 text-display font-light">About Invitra</h1>
          <p className="mt-8 leading-relaxed">Invitra, also known as Invatria at {new URL(SITE_URL).hostname}, is a digital invitation studio for weddings, birthdays, engagements and other events. You can preview six designs, customize your event details, and publish an invitation with a shareable link.</p>
          <section id="product-facts" aria-labelledby="product-facts-heading" className="mt-12 scroll-mt-24">
            <h2 id="product-facts-heading" className="text-title">What is Invitra?</h2>
            <p className="mt-5 leading-relaxed">{PRODUCT_SUMMARY}</p>
            <dl className="mt-7 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] px-5">
              {PRODUCT_FACTS.map(fact => (
                <div key={fact.label} className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="font-medium">{fact.label}</dt>
                  <dd className="leading-relaxed">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <h2 className="mt-12 text-title">What you can create</h2>
          <p className="mt-5 leading-relaxed">Invitations can include an event schedule, venue information, a photo gallery, music and a countdown. Guests can open a published invitation in their browser, RSVP and leave a guest-book message without creating an account.</p>
          <h2 className="mt-12 text-title">Saving and managing invitations</h2>
          <p className="mt-5 leading-relaxed">A free account is required to save, upload media and publish. Hosts can return to My invitations to manage their event and review guest responses. The invitation tools are free to use, with advertising on the studio pages.</p>
          <h2 className="mt-12 text-title">About this publisher</h2>
          <p className="mt-5 leading-relaxed">Invitra publishes the template previews, product descriptions and invitation guidance on this website to help hosts choose a design and prepare their event page. Explore the templates and demo to see how the service works before creating an account.</p>
          <nav aria-label="Explore Invitra" className="mt-10 flex flex-wrap gap-6 underline underline-offset-4">
            <Link href="/templates">Browse templates</Link>
            <Link href="/demo">View an invitation example</Link>
            <Link href="/#faq">Read frequently asked questions</Link>
            <Link href="/invitations">Find invitation wording by occasion</Link>
            <a href="/llms.txt">Plain-text product summary</a>
          </nav>
        </article>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{
        "@context": "https://schema.org", "@type": "AboutPage", name: "About Invitra", url: `${SITE_URL}/about`,
        mainEntity: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Invitra", alternateName: "Invatria", url: SITE_URL,
          description: "A digital invitation studio with customizable templates, online RSVPs and a guest book." },
        about: { "@id": `${SITE_URL}/#application` },
      }, PRODUCT_APPLICATION_JSON_LD]).replace(/</g, "\u003c") }} />
    </>
  );
}
