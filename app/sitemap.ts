import type { MetadataRoute } from "next";
import { TEMPLATES } from "@/lib/templates";
import { SITE_URL } from "@/lib/site";

const SITE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...TEMPLATES.map((t) => ({
      url: `${SITE}/templates/${t.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
