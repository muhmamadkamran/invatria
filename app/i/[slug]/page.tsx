import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { InvitationRow } from "@/lib/supabase/types";
import type { Invitation } from "@/lib/types";
import { getOccasion } from "@/lib/occasions";
import { formatLongDate } from "@/lib/utils";
import { PublicInvitation } from "@/components/invitation/public";

/* Invitations change rarely and are read constantly, so they are cached at the
   edge and revalidated in the background. A guest opening the link gets HTML
   immediately rather than a spinner while the browser queries a database. */
export const revalidate = 60;
export const dynamicParams = true;

/** Generating no params keeps the build fast; pages are rendered on first hit
 *  and then cached. There is no list of slugs to enumerate at build time. */
export function generateStaticParams() {
  return [];
}

async function fetchInvitation(slug: string): Promise<Invitation | null> {
  const sb = await createClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from("invitations")
    .select("*")
    .ilike("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as InvitationRow;

  return {
    ...row.data,
    id: row.id,
    slug: row.slug,
    published: row.published,
    templateId: row.template_id as Invitation["templateId"],
    category: row.category as Invitation["category"],
    language: row.language as Invitation["language"],
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function headline(inv: Invitation) {
  const o = getOccasion(inv.category);
  const { hostPrimary: a, hostSecondary: b } = inv;
  if (!b) return a || "You're invited";
  if (o.nameMode === "couple") return `${a} ${inv.joinWord || "&"} ${b}`;
  return `${a} — ${b}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inv = await fetchInvitation(slug);

  if (!inv) {
    return {
      title: "You're invited",
      description: "An invitation made with Invitra.",
      robots: { index: false, follow: false },
    };
  }

  const title = headline(inv);
  const when = formatLongDate(inv.date);
  const where = inv.venueName || inv.venueAddress;
  const description =
    inv.invitationNote?.trim() ||
    [inv.tagline, when, where].filter(Boolean).join(" · ");

  const image = inv.cover?.url;

  return {
    title,
    description,
    /* Private by nature — a wedding invitation has no business in search
       results, but it must still unfurl beautifully when it's shared. */
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "Invitra",
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await fetchInvitation(slug);

  /* When the server finds it, the guest gets fully-rendered HTML. When it
     doesn't — no backend configured, or a local-only invitation — the client
     falls back to looking in this browser's own storage. */
  return <PublicInvitation slug={slug} initial={invitation} />;
}
