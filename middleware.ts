import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on the way through.
 *
 * Access tokens are short-lived; without this the server-rendered routes and
 * the browser would drift out of sync and a host would appear signed out until
 * they reloaded. The matcher below deliberately excludes the public invitation
 * route and all static assets — those need no session, and every match here
 * costs a round trip to Supabase.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser() is what performs the refresh; the result is unused.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/create", "/my-invitations", "/auth/:path*"],
};
