import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InvitationDetail } from "@/components/dashboard/invitation-detail";

export const metadata: Metadata = {
  title: "Manage invitation",
  robots: { index: false, follow: false },
};

export default async function ManageInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <main id="main">
        <InvitationDetail id={id} />
      </main>
      <SiteFooter />
    </>
  );
}
