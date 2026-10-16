import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";
import type { Database } from "./types";

/** Published invitations are cached for every guest, so this client must never
 *  read a visitor's cookies or use their session. Public reads use the anon key
 *  and the database's published-only policies. */
export function createPublicClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
