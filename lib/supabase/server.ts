import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfiguredServer = Boolean(URL && ANON);

/**
 * Server-side client for React Server Components.
 *
 * Used to render a published invitation on the server — that is what gives
 * shared links a real preview in WhatsApp and iMessage, which a client-only
 * page can never have. It only ever uses the anon key; RLS does the rest.
 */
export async function createClient() {
  if (!supabaseConfiguredServer) return null;
  const store = await cookies();

  return createServerClient<Database>(URL!, ANON!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server Components cannot set cookies. Reading a published invitation
        // needs no session, so swallowing this is correct rather than lossy.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — nothing to refresh */
        }
      },
    },
  });
}
