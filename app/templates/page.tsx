import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ads";
import { TemplateBrowser } from "@/components/templates/browser";

export const metadata: Metadata = {
  title: "Free Digital Invitation Templates",
  alternates: { canonical: "/templates" },
  description:
    "Browse six free digital invitation templates for weddings, birthdays and other events. Preview a design, customize your details and share it online.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Breadcrumbs items={[{ name: "Templates", path: "/templates" }]} />
        <h1 className="sr-only">Free digital invitation templates</h1>
        <TemplateBrowser />
        <AdSlot slot="templates-foot" className="pb-20" />
      </main>
      <SiteFooter />
    </>
  );
}
