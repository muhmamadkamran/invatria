"use client";

import type { GuestMessage, Invitation, MediaRef, RsvpResponse } from "./types";
import { supabaseConfigured } from "./supabase/config";
import * as local from "./storage-local";

/* ============================================================================
   The storage contract.

   Every component talks to this module and nothing else, which is what made
   moving to Supabase a contained change. Two implementations sit behind it:

     • Supabase  — the production path, used whenever the env vars are set
     • IndexedDB — the fallback, so `npm run dev` works with no configuration
                   and a misconfigured deploy degrades instead of throwing on
                   every keystroke

   The Supabase module is imported dynamically: the SDK is ~75 kB and the
   marketing pages never touch a database, so it must not sit in the shared
   chunk. `usingCloud()` reads an env var only — no SDK import — so the UI can
   tell the user which backend is live without paying for the client.
   ========================================================================= */

export const usingCloud = () => supabaseConfigured;

type Remote = typeof import("./storage-remote");
let remoteModule: Remote | null = null;

async function remote(): Promise<Remote> {
  remoteModule ??= await import("./storage-remote");
  return remoteModule;
}

/* --- Invitations --------------------------------------------------------- */

export async function saveInvitation(inv: Invitation): Promise<void> {
  if (supabaseConfigured) return (await remote()).saveInvitation(inv);
  return local.saveInvitation(inv);
}

export async function loadInvitation(id: string): Promise<Invitation | null> {
  if (supabaseConfigured) return (await remote()).loadInvitation(id);
  return local.loadInvitation(id);
}

export async function listInvitations(): Promise<Invitation[]> {
  if (supabaseConfigured) return (await remote()).listInvitations();
  return local.listInvitations();
}

export async function findBySlug(slug: string): Promise<Invitation | null> {
  if (supabaseConfigured) return (await remote()).findBySlug(slug);
  return local.findBySlug(slug);
}

export async function deleteInvitation(id: string): Promise<void> {
  if (supabaseConfigured) return (await remote()).deleteInvitation(id);
  return local.deleteInvitation(id);
}

export async function isSlugAvailable(slug: string, selfId?: string): Promise<boolean> {
  if (supabaseConfigured) return (await remote()).isSlugAvailable(slug, selfId);
  return local.isSlugAvailable(slug, selfId);
}

/* --- Media ---------------------------------------------------------------- */

export async function putMedia(
  file: File,
  kind: MediaRef["kind"] = "image",
): Promise<MediaRef> {
  if (supabaseConfigured) return (await remote()).putMedia(file, kind);
  return local.putMedia(file, kind);
}

export async function mediaUrl(ref: MediaRef | null | undefined): Promise<string> {
  /* A ref that already carries a URL resolves identically in either mode —
     which is what lets a cloud invitation render without loading the SDK. */
  if (ref?.url) return ref.url;
  if (!ref?.key) return "";
  return local.mediaUrl(ref);
}

export async function removeMedia(ref: MediaRef | null | undefined): Promise<void> {
  if (supabaseConfigured && ref?.path) return (await remote()).removeMedia(ref);
  return local.removeMedia(ref);
}

/* --- Guest submissions ---------------------------------------------------- */

export async function addRsvp(
  r: Omit<RsvpResponse, "id" | "createdAt">,
): Promise<RsvpResponse | null> {
  if (supabaseConfigured) return (await remote()).addRsvp(r);
  return local.addRsvp(r);
}

export async function addGuestMessage(
  m: Omit<GuestMessage, "id" | "createdAt">,
): Promise<GuestMessage | null> {
  if (supabaseConfigured) return (await remote()).addGuestMessage(m);
  return local.addGuestMessage(m);
}

export async function listRsvps(invitationId: string): Promise<RsvpResponse[]> {
  if (supabaseConfigured) return (await remote()).listRsvps(invitationId);
  return local.listRsvps(invitationId);
}

export async function listGuestMessages(invitationId: string): Promise<GuestMessage[]> {
  if (supabaseConfigured) return (await remote()).listGuestMessages(invitationId);
  return local.listGuestMessages(invitationId);
}

export async function deleteRsvp(id: string): Promise<void> {
  if (supabaseConfigured) return (await remote()).deleteRsvp(id);
  return local.deleteRsvp(id);
}

export async function deleteGuestMessage(id: string): Promise<void> {
  if (supabaseConfigured) return (await remote()).deleteGuestMessage(id);
  return local.deleteGuestMessage(id);
}

export async function setGuestMessageHidden(id: string, hidden: boolean): Promise<void> {
  if (supabaseConfigured) return (await remote()).setGuestMessageHidden(id, hidden);
  return local.setGuestMessageHidden(id, hidden);
}

/** Head counts, aggregated in the database where one exists. */
export async function rsvpSummary(invitationId: string) {
  if (supabaseConfigured) {
    const rows = await (await remote()).rsvpSummary(invitationId);
    if (rows) return rows;
  }
  const all = await listRsvps(invitationId);
  const byStatus = new Map<string, { replies: number; heads: number }>();
  for (const r of all) {
    const cur = byStatus.get(r.status) ?? { replies: 0, heads: 0 };
    byStatus.set(r.status, {
      replies: cur.replies + 1,
      heads: cur.heads + Math.max(1, r.guests),
    });
  }
  return [...byStatus].map(([status, v]) => ({ status, ...v }));
}

/* --- Change notifications --------------------------------------------------
   Both implementations dispatch the same window event after a write. In cloud
   mode we additionally subscribe to Realtime, so a guest-book note left on
   someone else's phone appears live during the event.
-------------------------------------------------------------------------- */

export function onStoreChange(fn: () => void) {
  return local.onStoreChange(fn);
}

export function onResponsesChange(invitationId: string, fn: () => void) {
  const offLocal = local.onStoreChange(fn);
  let offRemote: () => void = () => {};
  let cancelled = false;

  if (supabaseConfigured) {
    void remote().then((r) => {
      if (cancelled) return;
      offRemote = r.subscribeToResponses(invitationId, fn);
    });
  }

  return () => {
    cancelled = true;
    offLocal();
    offRemote();
  };
}
