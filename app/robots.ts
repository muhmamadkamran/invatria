import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // People's invitations are private by nature — never index them.
      disallow: ["/i/", "/create", "/my-invitations"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
