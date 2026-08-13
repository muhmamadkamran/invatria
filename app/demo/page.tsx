import type { Metadata } from "next";
import { demoInvitation } from "@/lib/defaults";
import { InvitationView } from "@/components/invitation/view";
import { PreviewBar } from "@/components/templates/preview-bar";
import { TEMPLATE_MAP } from "@/lib/templates";

export const metadata: Metadata = {
  title: "A finished invitation",
  description:
    "See a complete Invitra invitation — envelope reveal, countdown, schedule, gallery, RSVP and guest book, exactly as your guests would.",
};

export default function DemoPage() {
  return (
    <>
      <PreviewBar template={TEMPLATE_MAP["royal-gold"]} />
      <main id="main">
        <InvitationView
          invitation={demoInvitation("royal-gold")}
          publicUrl="https://invitra.app/demo"
        />
      </main>
    </>
  );
}
