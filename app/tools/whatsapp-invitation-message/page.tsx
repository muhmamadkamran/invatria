import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppMessageBuilder } from "@/components/whatsapp-message-builder";
import { socialMetadata } from "@/lib/social-metadata";

const title = "Free WhatsApp Invitation Message Generator";
const description = "Write a wedding, birthday, baby shower or nikah invitation message for WhatsApp. Customize your details, add an RSVP link and copy your message for free.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/tools/whatsapp-invitation-message" }, ...socialMetadata(title, description, "/tools/whatsapp-invitation-message") };

export default function WhatsAppInvitationPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Breadcrumbs items={[{ name: "WhatsApp invitation message", path: "/tools/whatsapp-invitation-message" }]} />
        <article className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="eyebrow">Free wording tool</p>
          <h1 className="mt-4 max-w-3xl text-display font-light">Write an invitation message for WhatsApp</h1>
          <p className="mt-7 max-w-3xl text-lg leading-relaxed">Prepare a message for a wedding, birthday, baby shower or nikah. Add your names, date, venue and optional invitation link, then copy the wording or open WhatsApp to choose your recipients.</p>
          <p className="mt-4 max-w-3xl leading-relaxed">No account is required to prepare wording here. A free host account is required to save and publish an Invitra invitation with online RSVP.</p>
          <WhatsAppMessageBuilder />
          <section className="mt-16 max-w-3xl">
            <h2 className="text-title">How to send your invitation link</h2>
            <ol className="mt-6 list-decimal space-y-4 pl-5 leading-relaxed">
              <li>Choose a design, enter your event details and publish your invitation from your Invitra account.</li>
              <li>Copy the published link into the optional link field above. Check that it opens on another device or in a private browser window.</li>
              <li>Fill in the event date, time and venue. Add arrival times or other guest instructions, then review the wording and replace every bracketed placeholder.</li>
              <li>Copy the message into your chat, or use the WhatsApp button and select recipients yourself. Review replies in My invitations after guests RSVP on the event page.</li>
            </ol>
          </section>
          <section className="mt-12 max-w-3xl">
            <h2 className="text-title">What should the message include?</h2>
            <p className="mt-5 leading-relaxed">Keep the main message brief: who is hosting, what the event is, when and where it takes place, and how to reply. The invitation page can hold the detailed schedule, gallery, directions and RSVP form. Use the guest instructions field to explain separate arrival and ceremony times.</p>
          </section>
          <nav aria-label="Related invitation wording" className="mt-12 flex flex-wrap gap-5 text-sm underline underline-offset-4">
            <Link href="/invitations/wedding">Wedding invitation wording</Link>
            <Link href="/invitations/birthday">Birthday invitation wording</Link>
            <Link href="/invitations/nikah">Nikah invitation wording</Link>
            <Link href="/templates">Browse invitation designs</Link>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
