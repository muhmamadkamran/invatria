// ============================================================================
// submit-response — the one public write endpoint.
//
// RSVPs and guest-book notes are the only things an unauthenticated stranger
// can create, so they do not go straight to the table: RLS grants anon no
// INSERT at all. Everything arrives here, where we can
//
//   * confirm the invitation exists and is actually published,
//   * throttle by IP so the guest book cannot be flooded,
//   * verify a Cloudflare Turnstile token when one is configured,
//   * and only then insert with the service-role key.
//
// The service-role key lives here and nowhere else. It is never shipped to
// the browser.
// ============================================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET_KEY");
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/** Requests allowed per IP per window, per kind of submission. */
const LIMIT = 8;
const WINDOW_MINUTES = 10;

function corsHeaders(origin: string | null) {
  const allow =
    ALLOWED_ORIGINS.includes("*") || (origin && ALLOWED_ORIGINS.includes(origin))
      ? (origin ?? "*")
      : ALLOWED_ORIGINS[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function passesTurnstile(token: string | undefined, ip: string) {
  if (!TURNSTILE_SECRET) return true; // not configured — nothing to enforce
  if (!token) return false;

  const form = new FormData();
  form.append("secret", TURNSTILE_SECRET);
  form.append("response", token);
  form.append("remoteip", ip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const out = (await res.json()) as { success?: boolean };
    return Boolean(out.success);
  } catch {
    return false; // fail closed
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  let body: {
    kind?: string;
    invitationId?: string;
    payload?: Record<string, unknown>;
    token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Malformed request" }, 400, origin);
  }

  const { kind, invitationId, payload = {}, token } = body;

  if (kind !== "rsvp" && kind !== "guest-message") {
    return json({ error: "Unknown submission type" }, 400, origin);
  }
  if (!invitationId || typeof invitationId !== "string") {
    return json({ error: "Missing invitation" }, 400, origin);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // --- the invitation must exist and be live --------------------------------
  const { data: invitation, error: lookupError } = await db
    .from("invitations")
    .select("id, published, data")
    .eq("id", invitationId)
    .maybeSingle();

  if (lookupError) return json({ error: "Lookup failed" }, 500, origin);
  if (!invitation || !invitation.published) {
    return json({ error: "This invitation is no longer accepting replies" }, 404, origin);
  }

  // --- throttle -------------------------------------------------------------
  const bucket = `${kind}:${invitationId}:${ip}`;
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  const { data: limitRow } = await db
    .from("rate_limits")
    .select("hits, window_start")
    .eq("bucket", bucket)
    .maybeSingle();

  if (limitRow && limitRow.window_start > windowStart) {
    if (limitRow.hits >= LIMIT) {
      return json(
        { error: "That's a lot of replies in a short time. Try again shortly." },
        429,
        origin,
      );
    }
    await db
      .from("rate_limits")
      .update({ hits: limitRow.hits + 1 })
      .eq("bucket", bucket);
  } else {
    await db
      .from("rate_limits")
      .upsert({ bucket, hits: 1, window_start: new Date().toISOString() });
  }

  // --- captcha --------------------------------------------------------------
  if (!(await passesTurnstile(token, ip))) {
    return json({ error: "Could not verify that you're human" }, 403, origin);
  }

  // --- insert ---------------------------------------------------------------
  if (kind === "rsvp") {
    const name = clean(payload.name, 120);
    const status = String(payload.status ?? "");
    if (name.length < 1) return json({ error: "A name is required" }, 400, origin);
    if (!["attending", "not-attending", "maybe"].includes(status)) {
      return json({ error: "Invalid attendance value" }, 400, origin);
    }

    const guestsRaw = Number(payload.guests ?? 1);
    const guests = Number.isFinite(guestsRaw)
      ? Math.min(50, Math.max(0, Math.trunc(guestsRaw)))
      : 1;

    const { data, error } = await db
      .from("rsvps")
      .insert({
        invitation_id: invitationId,
        name,
        email: clean(payload.email, 254) || null,
        status,
        guests,
        meal: clean(payload.meal, 120) || null,
        message: clean(payload.message, 2000) || null,
      })
      .select("id, created_at")
      .single();

    if (error) return json({ error: "Could not record that reply" }, 500, origin);
    return json({ id: data.id, createdAt: data.created_at }, 200, origin);
  }

  const name = clean(payload.name, 120);
  const message = clean(payload.message, 2000);
  if (name.length < 1 || message.length < 1) {
    return json({ error: "A name and a message are required" }, 400, origin);
  }

  const { data, error } = await db
    .from("guest_messages")
    .insert({ invitation_id: invitationId, name, message })
    .select("id, created_at")
    .single();

  if (error) return json({ error: "Could not save that note" }, 500, origin);
  return json({ id: data.id, createdAt: data.created_at }, 200, origin);
});
