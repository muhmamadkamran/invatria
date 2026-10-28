import { Breadcrumbs } from "@/components/breadcrumbs";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { demoInvitation } from "@/lib/defaults";
import { InvitationView } from "@/components/invitation/view";
import { PreviewBar } from "@/components/templates/preview-bar";
import { TEMPLATE_MAP } from "@/lib/templates";
import { socialMetadata } from "@/lib/social-metadata";

const title = "A finished invitation";
const description = "See a complete Invitra invitation — envelope reveal, countdown, schedule, gallery, RSVP and guest book, exactly as your guests would.";

export const metadata: Metadata = {
  title,
  alternates: { canonical: "/demo" },
  description,
  ...socialMetadata(title, description, "/demo"),
};

export default function DemoPage() {
  return (
    <>
      <PreviewBar template={TEMPLATE_MAP["royal-gold"]} />
      <main id="main">
        <Breadcrumbs items={[{ name: "Demo invitation", path: "/demo" }]} />
        <InvitationView
          invitation={demoInvitation("royal-gold")}
          publicUrl={absoluteUrl("/demo")}
        />
      </main>
    </>
  );
}
