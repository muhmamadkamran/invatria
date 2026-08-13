"use client";

import type {
  GuestMessage,
  Invitation,
  MediaRef,
  RsvpResponse,
} from "./types";
import { ensureUser, getSupabase } from "./supabase/client";
import type { InvitationRow } from "./supabase/types";
import { isUuid, uid } from "./utils";

/* ============================================================================
   The Supabase implementation of the storage contract.

   Every function here mirrors one in `storage-local.ts`; `storage.ts` picks
   between them. Row-level security does the authorisation, so nothing in this
   file needs to check ownership by hand.
   ========================================================================= */

const BUCKET: Record<MediaRef["kind"], string> = {
  image: "galleries",
  audio: "audio",
  video: "galleries",
};

function rowToInvitation(row: InvitationRow): Invitation {
  /* The jsonb column is the source of truth for the body; the promoted columns
     win for anything the database also tracks, so a row edited directly in the
     dashboard still reads back correctly. */
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

function invitationToRow(inv: Invitation) {
  return {
    id: inv.id,
    slug: inv.slug,
    published: inv.published,
    template_id: inv.templateId,
    category: inv.category,
    language: inv.language,
    data: inv,
  };
}

/* --- Invitations --------------------------------------------------------- */

export async function saveInvitation(inv: Invitation) {
  const sb = getSupabase();
  if (!sb) return;
  await ensureUser();

  const { error } = await sb
    .from("invitations")
    .upsert(invitationToRow(inv), { onConflict: "id" });

  if (error) throw new Error(`Could not save invitation: ${error.message}`);
  notify();
}

export async function loadInvitation(id: string): Promise<Invitation | null> {
  const sb = getSupabase();
  /* Ids from before the backend existed ("inv_970b7088") are not uuids and
     would make Postgres reject the query outright. Treat them as "not here";
     `migrateLocalToCloud` re-homes them under a real uuid. */
  if (!sb || !isUuid(id)) return null;
  const { data, error } = await sb.from("invitations").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToInvitation(data as InvitationRow);
}

export async function listInvitations(): Promise<Invitation[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("invitations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return (data as InvitationRow[]).map(rowToInvitation);
}

export async function findBySlug(slug: string): Promise<Invitation | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("invitations")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return rowToInvitation(data as InvitationRow);
}

export async function deleteInvitation(id: string) {
  const sb = getSupabase();
  if (!sb || !isUuid(id)) return;

  /* Replies and notes go with it via ON DELETE CASCADE, but stored objects are
     outside the database, so they have to be removed explicitly. */
  const inv = await loadInvitation(id);
  if (inv) {
    const refs = [inv.cover, inv.music.source, ...inv.gallery].filter(
      (r): r is MediaRef => Boolean(r?.path),
    );
    const byBucket = new Map<string, string[]>();
    for (const r of refs) {
      const bucket = r.bucket ?? BUCKET[r.kind];
      byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), r.path!]);
    }
    await Promise.all(
      [...byBucket].map(([bucket, paths]) => sb.storage.from(bucket).remove(paths)),
    );
  }

  const { error } = await sb.from("invitations").delete().eq("id", id);
  if (error) throw new Error(`Could not delete invitation: ${error.message}`);
  notify();
}

export async function isSlugAvailable(slug: string, selfId?: string) {
  const sb = getSupabase();
  if (!sb) return true;
  const { data, error } = await sb.rpc("is_slug_available", {
    candidate: slug,
    self_id: selfId ?? null,
  });
  if (error) return false;
  return Boolean(data);
}

/* --- Media ---------------------------------------------------------------- */

export async function putMedia(
  file: File,
  kind: MediaRef["kind"] = "image",
  bucketOverride?: string,
): Promise<MediaRef> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured");

  const userId = await ensureUser();
  if (!userId) throw new Error("Could not establish a session for the upload");

  const bucket = bucketOverride ?? BUCKET[kind];
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${userId}/${uid()}.${ext}`;

  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = sb.storage.from(bucket).getPublicUrl(path);

  const ref: MediaRef = {
    id: path,
    url: data.publicUrl,
    bucket,
    path,
    name: file.name,
    kind,
  };

  if (kind === "image") {
    const dims = await imageSize(file).catch(() => null);
    if (dims) {
      ref.width = dims.width;
      ref.height = dims.height;
    }
  }
  return ref;
}

export async function mediaUrl(ref: MediaRef | null | undefined) {
  return ref?.url ?? "";
}

export async function removeMedia(ref: MediaRef | null | undefined) {
  const sb = getSupabase();
  if (!sb || !ref?.path) return;
  await sb.storage.from(ref.bucket ?? BUCKET[ref.kind]).remove([ref.path]);
}

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* --- Guest submissions ----------------------------------------------------
   These are public writes, so they do not go straight to the table. The
   `submit-response` Edge Function holds the service-role key, throttles by IP
   and can verify a captcha; RLS grants anon no INSERT at all.
-------------------------------------------------------------------------- */

async function submit(
  kind: "rsvp" | "guest-message",
  invitationId: string,
  payload: Record<string, unknown>,
) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured");

  const { data, error } = await sb.functions.invoke("submit-response", {
    body: { kind, invitationId, payload, token: getCaptchaToken() },
  });

  if (error) {
    const message =
      (data as { error?: string } | null)?.error ??
      "We couldn't send that just now. Please try again.";
    throw new Error(message);
  }
  notify();
  return data as { id: string; createdAt: string };
}

/** Reads a Turnstile token if the widget is present; harmless when it isn't. */
function getCaptchaToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.querySelector<HTMLInputElement>(
    'input[name="cf-turnstile-response"]',
  );
  return el?.value || undefined;
}

export async function addRsvp(r: Omit<RsvpResponse, "id" | "createdAt">) {
  const res = await submit("rsvp", r.invitationId, {
    name: r.name,
    email: r.email || null,
    status: r.status,
    guests: r.guests,
    meal: r.meal || null,
    message: r.message || null,
  });
  return {
    ...r,
    id: res.id,
    createdAt: new Date(res.createdAt).getTime(),
  } as RsvpResponse;
}

export async function addGuestMessage(m: Omit<GuestMessage, "id" | "createdAt">) {
  const res = await submit("guest-message", m.invitationId, {
    name: m.name,
    message: m.message,
  });
  return {
    ...m,
    id: res.id,
    createdAt: new Date(res.createdAt).getTime(),
  } as GuestMessage;
}

/* --- Reading responses ---------------------------------------------------- */

export async function listRsvps(invitationId: string): Promise<RsvpResponse[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("rsvps")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    invitationId: r.invitation_id,
    name: r.name,
    email: r.email ?? "",
    status: r.status,
    guests: r.guests,
    meal: r.meal ?? undefined,
    message: r.message ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function listGuestMessages(invitationId: string): Promise<GuestMessage[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("guest_messages")
    .select("*")
    .eq("invitation_id", invitationId)
    .eq("hidden", false)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((m) => ({
    id: m.id,
    invitationId: m.invitation_id,
    name: m.name,
    message: m.message,
    createdAt: new Date(m.created_at).getTime(),
  }));
}

/** Hosts can remove a reply, and hide or delete a guest-book note. RLS makes
 *  sure only the invitation's owner can do any of it. */
export async function deleteRsvp(id: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("rsvps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

export async function setGuestMessageHidden(id: string, hidden: boolean) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("guest_messages").update({ hidden }).eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

export async function deleteGuestMessage(id: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("guest_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

/** Head counts computed in the database rather than in the browser. */
export async function rsvpSummary(invitationId: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("rsvp_summary", { invitation: invitationId });
  if (error || !data) return null;
  return data as { status: string; replies: number; heads: number }[];
}

/** Live guest-book updates during the event. Returns an unsubscribe function. */
export function subscribeToResponses(invitationId: string, onChange: () => void) {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(`invitation:${invitationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "guest_messages",
        filter: `invitation_id=eq.${invitationId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "rsvps",
        filter: `invitation_id=eq.${invitationId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void sb.removeChannel(channel);
  };
}

/* --- Change notifications -------------------------------------------------- */

const CHANNEL = "invitra:changed";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL));
}
