import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfiguredServer = Boolean(URL && ANON);

/**
 * Server-side client for React Server Components.
 *
 * Used by authenticated request handlers, including the email-confirmation
 * callback. Cached public invitation pages use the cookie-free public client
 * instead, so their rendering mode never depends on a visitor's session.
 */
export async function createClient() {
  if (!supabaseConfiguredServer) return null;
  const store = await cookies();

  return createServerClient<Database>(URL!, ANON!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Route handlers can set cookies; Server Components can only read
        // them and rely on middleware to refresh the session instead.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — nothing to refresh */
        }
      },
    },
  });
}
