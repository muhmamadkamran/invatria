"use client";

import type {
  GuestMessage,
  Invitation,
  MediaRef,
  RsvpResponse,
} from "./types";
import { currentUserId, ensureUser, getSupabase } from "./supabase/client";
import type { InvitationRow } from "./supabase/types";
import { isUuid, uid } from "./utils";

/* ============================================================================
   The Supabase implementation of the storage contract.

   All app data is stored here. Host operations validate the account with Auth
   and scope private management reads to its owner; RLS also enforces access.
   ========================================================================= */

const BUCKET: Record<MediaRef["kind"], string> = {
  image: "galleries",
  audio: "audio",
  video: "galleries",
};

function requiredSupabase() {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured. Please connect the database before saving or publishing.");
  return sb;
}

const pendingSaves = new Map<string, Promise<void>>();
const MEDIA_BUCKETS = new Set(["covers", "galleries", "audio"]);

function invitationMedia(inv: Invitation): MediaRef[] {
  return [
    inv.cover,
    inv.music?.source,
    ...(inv.gallery ?? []),
    ...(inv.story?.chapters ?? []).map((chapter) => chapter.image),
    ...(inv.family?.members ?? []).map((member) => member.image),
  ].filter((ref): ref is MediaRef => Boolean(ref?.path));
}

function mediaKey(ref: MediaRef) {
  return `${ref.bucket ?? BUCKET[ref.kind]}/${ref.path}`;
}

/** Cleanup is best effort and runs only after the invitation has been deleted.
 *  Replacements are retained during autosave: client-side pruning cannot make
 *  a storage deletion atomic with saving references in another tab. */
async function pruneDeletedInvitationMedia(inv: Invitation, ownerId: string) {
  const candidates = invitationMedia(inv).filter((ref) =>
    ref.path!.startsWith(`${ownerId}/`) && MEDIA_BUCKETS.has(ref.bucket ?? BUCKET[ref.kind]),
  );
  if (!candidates.length) return;
  const sb = requiredSupabase();
  if ((await ensureUser()) !== ownerId) return;

  const referenced = new Set<string>();
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await sb.from("invitations")
      .select("data")
      .eq("owner_id", ownerId)
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Could not check shared media references: ${error.message}`);
    for (const row of data ?? []) {
      for (const ref of invitationMedia(row.data)) referenced.add(mediaKey(ref));
    }
    if (!data || data.length < pageSize) break;
  }

  if ((await ensureUser()) !== ownerId) return;
  const byBucket = new Map<string, Set<string>>();
  for (const ref of candidates) {
    if (referenced.has(mediaKey(ref))) continue;
    const bucket = ref.bucket ?? BUCKET[ref.kind];
    const paths = byBucket.get(bucket) ?? new Set<string>();
    paths.add(ref.path!);
    byBucket.set(bucket, paths);
  }
  for (const [bucket, paths] of byBucket) {
    const { error } = await sb.storage.from(bucket).remove([...paths]);
    if (error) throw new Error(`Could not remove deleted invitation media: ${error.message}`);
  }
}

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
  const row = invitationToRow(inv);
  // Capture identity when the save is requested, including queued saves.
  const requestedOwner = ensureUser().then(
    (id) => ({ id, error: null }),
    (error: unknown) => ({ id: null, error }),
  );
  const pending = (pendingSaves.get(inv.id) ?? Promise.resolve())
    .catch(() => {})
    .then(async () => {
      const sb = requiredSupabase();
      const owner = await requestedOwner;
      if (owner.error) throw owner.error;
      if (owner.id !== (await ensureUser())) {
        throw new Error("Your account changed while saving. Please reopen the invitation and try again.");
      }
      const { error } = await sb.from("invitations").upsert(row, { onConflict: "id" });
      if (error) throw new Error(`Could not save invitation: ${error.message}`);
      // Keep previous uploads: failed or concurrent edits must not lose media.
      notify();
    });
  pendingSaves.set(inv.id, pending);
  try {
    await pending;
  } finally {
    if (pendingSaves.get(inv.id) === pending) pendingSaves.delete(inv.id);
  }
}

export async function loadInvitation(id: string): Promise<Invitation | null> {
  const sb = getSupabase();
  // Legacy browser-only ids are not valid database keys.
  if (!sb || !isUuid(id)) return null;
  const ownerId = await currentUserId();
  if (!ownerId) return null;
  const { data, error } = await sb.from("invitations").select("*").eq("id", id).eq("owner_id", ownerId).maybeSingle();
  if (error) throw new Error(`Could not load invitation: ${error.message}`);
  if (!data) return null;
  return rowToInvitation(data as InvitationRow);
}

export async function listInvitations(): Promise<Invitation[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const ownerId = await currentUserId();
  if (!ownerId) return [];
  const { data, error } = await sb
    .from("invitations")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Could not load your invitations: ${error.message}`);
  if (!data) return [];
  return (data as InvitationRow[]).map(rowToInvitation);
}

export async function findBySlug(slug: string): Promise<Invitation | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("invitations")
    .select("*")
    .ilike("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`Could not load the shared invitation: ${error.message}`);
  if (!data) return null;
  return rowToInvitation(data as InvitationRow);
}

export async function deleteInvitation(id: string) {
  const sb = requiredSupabase();
  const ownerId = await ensureUser();
  if (!isUuid(id)) return;
  await pendingSaves.get(id)?.catch(() => {});

  const inv = await loadInvitation(id);
  if (!inv) return;
  if ((await ensureUser()) !== ownerId) throw new Error("Your account changed. Please reopen the invitation and try again.");
  const { error } = await sb.from("invitations").delete().eq("id", id).eq("owner_id", ownerId);
  if (error) throw new Error(`Could not delete invitation: ${error.message}`);
  notify();
  try {
    await pruneDeletedInvitationMedia(inv, ownerId);
  } catch (err) {
    // The durable deletion succeeded; a storage outage must not report failure.
    console.warn("[invitra] invitation deleted; unused media cleanup deferred:", err);
  }
}

export async function isSlugAvailable(slug: string, selfId?: string) {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb.rpc("is_slug_available", {
    candidate: slug,
    self_id: selfId ?? null,
  });
  if (error) throw new Error(`Could not check link availability: ${error.message}`);
  return Boolean(data);
}

/* --- Media ---------------------------------------------------------------- */

export async function putMedia(
  file: File,
  kind: MediaRef["kind"] = "image",
  bucketOverride?: string,
): Promise<MediaRef> {
  const sb = requiredSupabase();

  const userId = await ensureUser();

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
  if (!ref?.path) return;
  const sb = requiredSupabase();
  await ensureUser();
  const { error } = await sb.storage.from(ref.bucket ?? BUCKET[ref.kind]).remove([ref.path]);
  if (error) throw new Error(`Could not remove media: ${error.message}`);
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
  const sb = requiredSupabase();

  const { data, error } = await sb.functions.invoke("submit-response", {
    body: { kind, invitationId, payload, token: getCaptchaToken() },
  });

  if (error) {
    const message =
      (data as { error?: string } | null)?.error ??
      "We couldn't send that just now. Please try again.";
    throw new Error(message);
  }
  const result = data as { id?: unknown; createdAt?: unknown; error?: unknown } | null;
  if (typeof result?.error === "string") throw new Error(result.error);
  if (typeof result?.id !== "string" || !isUuid(result.id)
    || typeof result.createdAt !== "string" || !Number.isFinite(Date.parse(result.createdAt))) {
    throw new Error("The reply service did not confirm a saved response. Please try again.");
  }
  notify();
  return { id: result.id, createdAt: result.createdAt };
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
  if (error) throw new Error(`Could not load responses: ${error.message}`);
  if (!data) return [];
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
  if (error) throw new Error(`Could not load guest messages: ${error.message}`);
  if (!data) return [];
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
  const sb = requiredSupabase();
  await ensureUser();
  const { error } = await sb.from("rsvps").delete().eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

export async function setGuestMessageHidden(id: string, hidden: boolean) {
  const sb = requiredSupabase();
  await ensureUser();
  const { error } = await sb.from("guest_messages").update({ hidden }).eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

export async function deleteGuestMessage(id: string) {
  const sb = requiredSupabase();
  await ensureUser();
  const { error } = await sb.from("guest_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  notify();
}

/** Head counts computed in the database rather than in the browser. */
export async function rsvpSummary(invitationId: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("rsvp_summary", { invitation: invitationId });
  if (error) throw new Error(`Could not load response summary: ${error.message}`);
  if (!data) return null;
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
