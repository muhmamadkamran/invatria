"use client";

import type { GuestMessage, Invitation, MediaRef, RsvpResponse } from "./types";
import { supabaseConfigured } from "./supabase/config";

/** App data lives in Supabase. A missing configuration never writes locally. */
export const usingCloud = () => supabaseConfigured;

type Remote = typeof import("./storage-remote");
let remoteModule: Remote | null = null;

async function remote(): Promise<Remote> {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured. Please connect the database before saving or publishing.");
  }
  remoteModule ??= await import("./storage-remote");
  return remoteModule;
}

export async function saveInvitation(inv: Invitation): Promise<void> {
  return (await remote()).saveInvitation(inv);
}

export async function loadInvitation(id: string): Promise<Invitation | null> {
  return supabaseConfigured ? (await remote()).loadInvitation(id) : null;
}

export async function listInvitations(): Promise<Invitation[]> {
  return supabaseConfigured ? (await remote()).listInvitations() : [];
}

export async function findBySlug(slug: string): Promise<Invitation | null> {
  return supabaseConfigured ? (await remote()).findBySlug(slug) : null;
}

export async function deleteInvitation(id: string): Promise<void> {
  return (await remote()).deleteInvitation(id);
}

export async function isSlugAvailable(slug: string, selfId?: string): Promise<boolean> {
  return supabaseConfigured ? (await remote()).isSlugAvailable(slug, selfId) : false;
}

export async function putMedia(file: File, kind: MediaRef["kind"] = "image"): Promise<MediaRef> {
  return (await remote()).putMedia(file, kind);
}

export async function mediaUrl(ref: MediaRef | null | undefined): Promise<string> {
  return ref?.url ?? "";
}

export async function removeMedia(ref: MediaRef | null | undefined): Promise<void> {
  if (!ref?.path) return;
  return (await remote()).removeMedia(ref);
}

export async function addRsvp(r: Omit<RsvpResponse, "id" | "createdAt">): Promise<RsvpResponse | null> {
  return (await remote()).addRsvp(r);
}

export async function addGuestMessage(m: Omit<GuestMessage, "id" | "createdAt">): Promise<GuestMessage | null> {
  return (await remote()).addGuestMessage(m);
}

export async function listRsvps(invitationId: string): Promise<RsvpResponse[]> {
  return supabaseConfigured ? (await remote()).listRsvps(invitationId) : [];
}

export async function listGuestMessages(invitationId: string): Promise<GuestMessage[]> {
  return supabaseConfigured ? (await remote()).listGuestMessages(invitationId) : [];
}

export async function deleteRsvp(id: string): Promise<void> {
  return (await remote()).deleteRsvp(id);
}

export async function deleteGuestMessage(id: string): Promise<void> {
  return (await remote()).deleteGuestMessage(id);
}

export async function setGuestMessageHidden(id: string, hidden: boolean): Promise<void> {
  return (await remote()).setGuestMessageHidden(id, hidden);
}

export async function rsvpSummary(invitationId: string) {
  return supabaseConfigured ? ((await (await remote()).rsvpSummary(invitationId)) ?? []) : [];
}

const CHANNEL = "invitra:changed";

/** Same-tab notifications contain no data and do not use browser storage. */
export function onStoreChange(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANNEL, fn);
  return () => window.removeEventListener(CHANNEL, fn);
}

export function onResponsesChange(invitationId: string, fn: () => void) {
  const offStore = onStoreChange(fn);
  let offRemote: () => void = () => {};
  let cancelled = false;

  if (supabaseConfigured) {
    void remote().then((r) => {
      if (!cancelled) offRemote = r.subscribeToResponses(invitationId, fn);
    });
  }

  return () => {
    cancelled = true;
    offStore();
    offRemote();
  };
}
