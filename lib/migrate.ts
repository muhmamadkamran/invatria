"use client";

import type { Invitation, MediaRef } from "./types";
import { supabaseConfigured } from "./supabase/config";
import { ensureUser } from "./supabase/client";
import * as local from "./storage-local";
import * as remote from "./storage-remote";
import { isUuid, newId } from "./utils";

/* ============================================================================
   One-time lift from IndexedDB to Supabase.

   Anyone who used Invitra before the backend existed has invitations sitting
   in their browser. On their first visit after the cloud is switched on, those
   are pushed up — media and all — so nothing is stranded. The local copies are
   deliberately left in place: if the upload half-fails, the original is still
   there to try again.
   ========================================================================= */

const FLAG = "invitra:migrated-to-cloud";
const ACTIVE_KEY = "invitra:active";

async function liftMedia(ref: MediaRef | null): Promise<MediaRef | null> {
  if (!ref) return null;
  if (ref.url) return ref; // already remote
  const blob = await local.readMediaBlob(ref);
  if (!blob) return null;

  const file = new File([blob], ref.name ?? "upload", {
    type: blob.type || "application/octet-stream",
  });
  try {
    const uploaded = await remote.putMedia(file, ref.kind);
    return { ...uploaded, caption: ref.caption };
  } catch {
    return null; // keep going; a missing photo beats a failed migration
  }
}

export async function migrateLocalToCloud(): Promise<{
  migrated: number;
  failed: number;
} | null> {
  if (!supabaseConfigured) return null;
  if (typeof localStorage === "undefined") return null;
  if (localStorage.getItem(FLAG)) return null;

  const invitations = await local.listInvitations();
  if (!invitations.length) {
    localStorage.setItem(FLAG, new Date().toISOString());
    return null;
  }

  const userId = await ensureUser();
  if (!userId) return null;

  let migrated = 0;
  let failed = 0;

  for (const inv of invitations) {
    try {
      const [cover, music, ...gallery] = await Promise.all([
        liftMedia(inv.cover),
        liftMedia(inv.music.source),
        ...inv.gallery.map((g) => liftMedia(g)),
      ]);

      /* Invitations made before the backend existed carry ids like
         "inv_970b7088". The database primary key is a uuid, so they need a
         real one — and the pointer to the open draft has to follow. */
      const nextId = isUuid(inv.id) ? inv.id : newId();

      const lifted: Invitation = {
        ...inv,
        id: nextId,
        cover,
        music: { ...inv.music, source: music },
        gallery: gallery.filter((g): g is MediaRef => Boolean(g)),
      };

      /* A slug that has since been claimed by someone else would violate the
         unique index, so fall back to a suffixed one rather than dropping the
         whole invitation. */
      if (!(await remote.isSlugAvailable(lifted.slug, lifted.id))) {
        lifted.slug = `${lifted.slug}-${lifted.id.slice(-4)}`.slice(0, 60);
      }

      await remote.saveInvitation(lifted);

      if (nextId !== inv.id && localStorage.getItem(ACTIVE_KEY) === inv.id) {
        localStorage.setItem(ACTIVE_KEY, nextId);
      }
      migrated++;
    } catch (err) {
      console.error("[invitra] could not migrate an invitation:", err);
      failed++;
    }
  }

  if (!failed) localStorage.setItem(FLAG, new Date().toISOString());
  return { migrated, failed };
}
