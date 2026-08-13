"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

export { supabaseConfigured };

const URL = SUPABASE_URL;
const ANON = SUPABASE_ANON_KEY;

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient<Database>(URL!, ANON!);
  return client;
}

/* ----------------------------------------------------------------------------
   Anonymous identity.

   Invitra promises no sign-up, so ownership is an anonymous auth user created
   on first write. It persists in the browser like any session, can be carried
   to another device with a transfer link, and can later be upgraded to a real
   email account without losing a single invitation.
--------------------------------------------------------------------------- */

let signingIn: Promise<string | null> | null = null;

export async function currentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Returns the caller's user id, signing them in anonymously if needed. */
export async function ensureUser(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const existing = await currentUserId();
  if (existing) return existing;

  // Collapse concurrent callers onto one sign-in.
  signingIn ??= (async () => {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) {
      console.error("[invitra] anonymous sign-in failed:", error.message);
      return null;
    }
    return data.user?.id ?? null;
  })().finally(() => {
    signingIn = null;
  });

  return signingIn;
}
