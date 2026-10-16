"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

export { supabaseConfigured };

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return client;
}

/** Validate identity with Supabase Auth; a local session alone is not enough. */
export async function currentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) return null;
    throw new Error(`Could not verify your account: ${error.message}`);
  }
  const user = data.user;
  if (!user || user.is_anonymous || !user.email || !user.email_confirmed_at) return null;
  return user.id;
}

/** Host writes require a registered account. Never create anonymous users. */
export async function ensureUser(): Promise<string> {
  if (!getSupabase()) {
    throw new Error("Supabase is not configured. Please connect the database before saving or publishing.");
  }
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("Please sign in with a confirmed email account before saving, uploading, or publishing.");
  }
  return userId;
}
