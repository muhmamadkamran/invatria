import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdSlot } from "@/components/ads";
import { TemplateBrowser } from "@/components/templates/browser";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Six premium invitation designs — Royal Gold, Romantic Blush, Moonlight Garden, Floral Paradise, Modern Luxury and Royal Mughal. Every one is free, with every feature unlocked.",
};

export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <TemplateBrowser />
        <AdSlot slot="templates-foot" className="pb-20" />
      </main>
      <SiteFooter />
    </>
  );
}
