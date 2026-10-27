import type { MetadataRoute } from "next";
import { TEMPLATES } from "@/lib/templates";
import { SITE_URL } from "@/lib/site";
import { INVITATION_GUIDES } from "@/lib/invitation-guides";

const SITE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/templates`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/demo`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/invitations`, changeFrequency: "monthly", priority: 0.8 },
    ...INVITATION_GUIDES.map(guide => ({ url: `${SITE}/invitations/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...TEMPLATES.map((t) => ({
      url: `${SITE}/templates/${t.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
