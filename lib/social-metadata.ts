import type { Metadata } from "next";

/** A local illustration, shared by public pages; generated without remote assets. */
export const SOCIAL_IMAGE = {
  url: "/images/invitra-share.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Invitra: create free digital invitations, share a link and collect online RSVPs.",
};

export function socialMetadata(title: string, description: string, path: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      url: path,
      siteName: "Invitra",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: SOCIAL_IMAGE.url, alt: SOCIAL_IMAGE.alt }],
    },
  };
}
