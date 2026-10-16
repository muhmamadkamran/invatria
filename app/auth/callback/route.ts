import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where email confirmation and password-reset links land.
 *
 * Supabase sends a one-time code; exchanging it here sets the session cookie
 * and then hands the visitor onward to wherever they were headed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/my-invitations";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // A consumed signup link may still belong to an already-confirmed account.
  // Offer normal sign-in instead of sending signup visitors to password reset.
  return NextResponse.redirect(`${origin}/create?auth=link`);
}
