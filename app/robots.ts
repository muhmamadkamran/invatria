import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/i/", "/create", "/my-invitations", "/auth/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      {
        // Search discovery, with the same private-path exclusions as other bots.
        userAgent: ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"],
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
