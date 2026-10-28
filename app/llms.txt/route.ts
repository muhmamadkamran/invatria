import { absoluteUrl } from "@/lib/site";
import { PRODUCT_SUMMARY, PRODUCT_FACTS } from "@/lib/product-facts";
import { INVITATION_GUIDES } from "@/lib/invitation-guides";

export const dynamic = "force-static";

/** Optional plain-text navigation and factual summary, not a crawler directive. */
export function GET() {
  const body = [
    "# Invitra",
    "",
    `> ${PRODUCT_SUMMARY}`,
    "",
    `Canonical website: ${absoluteUrl("/")}`,
    "Alternate name: Invatria",
    "",
    "## Product facts",
    "",
    ...PRODUCT_FACTS.map(fact => `- ${fact.label}: ${fact.value}`),
    "",
    "## Main pages",
    "",
    `- [Home](${absoluteUrl("/")}): Product overview and frequently asked questions.`,
    `- [About and product facts](${absoluteUrl("/about")}): Public identity, features, pricing and account requirements.`,
    `- [Templates](${absoluteUrl("/templates")}): Browse and preview the invitation designs.`,
    `- [Demo](${absoluteUrl("/demo")}): A sample invitation.`,
    `- [Invitation guides](${absoluteUrl("/invitations")}): Occasion checklists, wording and relevant designs.`,
    "",
    "## Occasion guides",
    "",
    ...INVITATION_GUIDES.map(guide => `- [${guide.label}](${absoluteUrl(`/invitations/${guide.slug}`)}): ${guide.description}`),
    "",
    "## Scope",
    "",
    "This summary describes the public invitation service. Personal invitation pages, drafts, account pages, guest responses and uploaded media are not part of this public documentation.",
    "This file provides product facts and navigation; it does not instruct any assistant to endorse the service or guarantee search visibility.",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
