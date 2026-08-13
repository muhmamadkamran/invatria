"use client";

import {
  createStore,
  get,
  set,
  del,
  keys,
  getMany,
  type UseStore,
} from "idb-keyval";
import type {
  GuestMessage,
  Invitation,
  MediaRef,
  RsvpResponse,
} from "./types";
import { uid } from "./utils";

/* ============================================================================
   Invitra stores locally by default: an invitation and its media live in the
   browser's IndexedDB, so the whole product works with no account, no server
   and no cost. `lib/remote.ts` describes the seam where Firebase + Cloudinary
   take over when credentials are configured.
   ========================================================================= */

let invitesStore: UseStore | null = null;
let mediaStore: UseStore | null = null;
let responsesStore: UseStore | null = null;

function stores() {
  if (typeof indexedDB === "undefined") return null;
  invitesStore ??= createStore("invitra", "invitations");
  mediaStore ??= createStore("invitra-media", "media");
  responsesStore ??= createStore("invitra-responses", "responses");
  return { invitesStore, mediaStore, responsesStore };
}

/* --- Invitations --------------------------------------------------------- */

export async function saveInvitation(inv: Invitation) {
  const s = stores();
  if (!s) return;
  await set(inv.id, { ...inv, updatedAt: Date.now() }, s.invitesStore);
  notify();
}

export async function loadInvitation(id: string): Promise<Invitation | null> {
  const s = stores();
  if (!s) return null;
  return (await get<Invitation>(id, s.invitesStore)) ?? null;
}

export async function listInvitations(): Promise<Invitation[]> {
  const s = stores();
  if (!s) return [];
  const ks = await keys(s.invitesStore);
  const all = await getMany<Invitation | undefined>(ks as string[], s.invitesStore);
  return all
    .filter((i): i is Invitation => Boolean(i))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function findBySlug(slug: string): Promise<Invitation | null> {
  const all = await listInvitations();
  return all.find((i) => i.slug === slug) ?? null;
}

export async function deleteInvitation(id: string) {
  const s = stores();
  if (!s) return;
  const inv = await loadInvitation(id);
  if (inv) {
    const refs = [inv.cover, inv.music.source, ...inv.gallery].filter(
      Boolean,
    ) as MediaRef[];
    await Promise.all(refs.map((r) => (r.key ? del(r.key, s.mediaStore) : null)));
  }
  await del(id, s.invitesStore);
  notify();
}

/** True when the slug is free (or already belongs to `selfId`). */
export async function isSlugAvailable(slug: string, selfId?: string) {
  const all = await listInvitations();
  return !all.some((i) => i.slug === slug && i.id !== selfId);
}

/* --- Media ---------------------------------------------------------------- */

const urlCache = new Map<string, string>();

export async function putMedia(
  file: File,
  kind: MediaRef["kind"] = "image",
): Promise<MediaRef> {
  const s = stores();
  const key = `m_${uid()}`;
  const ref: MediaRef = { id: key, key, name: file.name, kind };

  if (kind === "image") {
    const dims = await imageSize(file).catch(() => null);
    if (dims) {
      ref.width = dims.width;
      ref.height = dims.height;
    }
  }
  if (s) await set(key, file, s.mediaStore);
  urlCache.set(key, URL.createObjectURL(file));
  return ref;
}

/** Resolve a MediaRef to something an <img>/<audio> can consume. */
export async function mediaUrl(ref: MediaRef | null | undefined) {
  if (!ref) return "";
  if (ref.url) return ref.url;
  if (!ref.key) return "";
  const cached = urlCache.get(ref.key);
  if (cached) return cached;
  const s = stores();
  if (!s) return "";
  const blob = await get<Blob>(ref.key, s.mediaStore);
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  urlCache.set(ref.key, url);
  return url;
}

/** Raw blob behind a locally-stored ref — used when migrating to the cloud. */
export async function readMediaBlob(ref: MediaRef | null | undefined) {
  if (!ref?.key) return null;
  const s = stores();
  if (!s) return null;
  return (await get<Blob>(ref.key, s.mediaStore)) ?? null;
}

export async function removeMedia(ref: MediaRef | null | undefined) {
  if (!ref?.key) return;
  const s = stores();
  const cached = urlCache.get(ref.key);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(ref.key);
  }
  if (s) await del(ref.key, s.mediaStore);
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

/* --- RSVP + guest book ---------------------------------------------------- */

export async function addRsvp(r: Omit<RsvpResponse, "id" | "createdAt">) {
  const s = stores();
  if (!s) return null;
  const entry: RsvpResponse = { ...r, id: `r_${uid()}`, createdAt: Date.now() };
  await set(entry.id, entry, s.responsesStore);
  notify();
  return entry;
}

export async function addGuestMessage(
  m: Omit<GuestMessage, "id" | "createdAt">,
) {
  const s = stores();
  if (!s) return null;
  const entry: GuestMessage = { ...m, id: `g_${uid()}`, createdAt: Date.now() };
  await set(entry.id, entry, s.responsesStore);
  notify();
  return entry;
}

async function allResponses() {
  const s = stores();
  if (!s) return [];
  const ks = (await keys(s.responsesStore)) as string[];
  const rows = await getMany<RsvpResponse | GuestMessage | undefined>(
    ks,
    s.responsesStore,
  );
  return rows.filter((r): r is RsvpResponse | GuestMessage => Boolean(r));
}

export async function listRsvps(invitationId: string): Promise<RsvpResponse[]> {
  const all = await allResponses();
  return all
    .filter((r): r is RsvpResponse => r.id.startsWith("r_") && r.invitationId === invitationId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listGuestMessages(
  invitationId: string,
): Promise<GuestMessage[]> {
  const all = await allResponses();
  return all
    .filter((m): m is GuestMessage => m.id.startsWith("g_") && m.invitationId === invitationId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteRsvp(id: string) {
  const s = stores();
  if (!s) return;
  await del(id, s.responsesStore);
  notify();
}

export async function deleteGuestMessage(id: string) {
  const s = stores();
  if (!s) return;
  await del(id, s.responsesStore);
  notify();
}

/** No `hidden` column offline — hiding and deleting are the same thing here. */
export async function setGuestMessageHidden(id: string, hidden: boolean) {
  if (hidden) await deleteGuestMessage(id);
}

/* --- Change notifications so open tabs stay in sync ----------------------- */

const CHANNEL = "invitra:changed";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANNEL));
}

export function onStoreChange(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANNEL, fn);
  return () => window.removeEventListener(CHANNEL, fn);
}
