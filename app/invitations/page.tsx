import { socialMetadata } from "@/lib/social-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { INVITATION_GUIDES } from "@/lib/invitation-guides";

export const metadata: Metadata = {
  title: "Invitation Templates and Wording by Occasion",
  description: "Find wedding, birthday, baby shower and nikah invitation ideas. Browse free templates, copy sample wording and plan the details your guests need.",
  alternates: { canonical: "/invitations" },
  ...socialMetadata("Invitation Templates and Wording by Occasion", "Find wedding, birthday, baby shower and nikah invitation ideas, sample wording and free designs.", "/invitations"),
};

export default function InvitationsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Breadcrumbs items={[{ name: "Invitation ideas", path: "/invitations" }]} />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="eyebrow">Start with your occasion</p>
          <h1 className="mt-4 max-w-3xl text-display font-light">Invitation templates and wording for your event</h1>
          <p className="mt-6 max-w-2xl leading-relaxed">Find a design, check the details to include, and adapt a sample message for your guests. You can browse the guides and preview designs without an account. A free account is required to save and publish.</p>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {INVITATION_GUIDES.map(guide => (
              <li key={guide.slug}>
                <Link href={`/invitations/${guide.slug}`} className="block h-full rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-7 transition-colors hover:border-gold">
                  <h2 className="text-title font-light">{guide.label}</h2>
                  <p className="mt-4 leading-relaxed text-charcoal-400">{guide.intro}</p>
                  <span className="mt-5 inline-block text-sm underline underline-offset-4">Explore designs and wording</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-12">Sending your invite in a chat? <Link href="/tools/whatsapp-invitation-message" className="underline underline-offset-4">Prepare a WhatsApp invitation message</Link> with your event details and RSVP link.</p>
          <p className="mt-6">Planning another event? <Link href="/templates" className="underline underline-offset-4">Browse every template and occasion</Link>.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
