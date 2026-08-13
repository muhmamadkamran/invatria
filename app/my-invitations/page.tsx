import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "My Invitations",
  description:
    "Every invitation you've made, with RSVP replies, guest-book notes and image and PDF exports.",
  robots: { index: false },
};

export default function MyInvitationsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Dashboard />
      </main>
      <SiteFooter />
    </>
  );
}
