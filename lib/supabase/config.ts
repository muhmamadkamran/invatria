/** Deliberately importless.
 *
 *  Anything that only needs to *know* whether a backend exists imports this,
 *  not `client.ts` — otherwise the whole Supabase SDK gets pulled into every
 *  page that so much as renders a card preview.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
