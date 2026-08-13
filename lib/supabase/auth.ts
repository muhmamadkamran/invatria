"use client";

import { getSupabase } from "./client";

/* ============================================================================
   Accounts, without a wall in front of the product.

   A visitor starts anonymous and can build a whole invitation before Invitra
   ever asks who they are. At publish they're offered an account, and the
   upgrade happens *in place*: Supabase keeps the same `user.id`, so every
   invitation they already made stays theirs with no migration and no change to
   the RLS policies, which key off `owner_id`.
   ========================================================================= */

export type AuthResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string };

/** Confirmation links come back through /auth/callback, which exchanges the
 *  code for a session and then forwards to `next`. */
function callbackUrl(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Human wording for the handful of Supabase errors users actually hit. */
function readable(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match an account.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "There's already an account with that email. Try signing in instead.";
  if (m.includes("password should be at least"))
    return "Passwords need to be at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts just now. Please wait a minute and try again.";
  if (m.includes("email address") && m.includes("invalid"))
    return "That doesn't look like a valid email address.";
  return message;
}

/**
 * Turn the current anonymous visitor into a real account, keeping their id.
 * Falls back to a normal sign-up when there's no session at all yet.
 */
export async function claimAccount(
  email: string,
  password: string,
  /** Where the confirmation link should land them — normally the invitation
   *  they just published, so they can copy or share it straight away. */
  redirectPath = "/my-invitations",
): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No backend is configured." };

  const { data: sessionData } = await sb.auth.getSession();
  const user = sessionData.session?.user;

  if (user?.is_anonymous) {
    /* The upgrade path. Supabase sends a confirmation link to the new address;
       until it's clicked the account stays anonymous, so nothing is lost if
       they abandon halfway. */
    const { data, error } = await sb.auth.updateUser(
      { email, password },
      { emailRedirectTo: callbackUrl(redirectPath) },
    );
    if (error) return { ok: false, error: readable(error.message) };
    return { ok: true, needsConfirmation: !data.user?.email_confirmed_at };
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl(redirectPath) },
  });
  if (error) return { ok: false, error: readable(error.message) };
  return { ok: true, needsConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No backend is configured." };

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: readable(error.message) };
  return { ok: true, needsConfirmation: false };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No backend is configured." };

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error) return { ok: false, error: readable(error.message) };
  return { ok: true, needsConfirmation: true };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No backend is configured." };

  const { error } = await sb.auth.updateUser({ password });
  if (error) return { ok: false, error: readable(error.message) };
  return { ok: true, needsConfirmation: false };
}

/**
 * Signing out an anonymous user would strand every invitation they've made,
 * because that session *is* the only key to them. The UI never offers it, and
 * this refuses it as a second line of defence.
 */
export async function signOut(): Promise<AuthResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "No backend is configured." };

  const { data } = await sb.auth.getSession();
  if (data.session?.user.is_anonymous) {
    return {
      ok: false,
      error: "Add an email to your account first, or your invitations would be lost.",
    };
  }

  const { error } = await sb.auth.signOut();
  if (error) return { ok: false, error: readable(error.message) };
  return { ok: true, needsConfirmation: false };
}
