# Deploying Invitra

Target architecture:

```
User → Netlify (Next.js) → Supabase (Postgres + Auth + Storage + Edge Functions)
```

There is no separate backend server, and there never was one — the app used to
keep everything in the browser's IndexedDB. That code path still exists as an
offline fallback, but Supabase is now the real backend.

Everything below has been written and verified locally. The steps that need
your credentials are marked **you**; I could not run those from here.

---

## 1. Create the Supabase project — *you*

1. New project at [supabase.com](https://supabase.com). Pick a region near your
   guests, not near you.
2. **Authentication → Sign In / Providers:**
   - **Anonymous sign-ins → enable.** Ownership starts as an anonymous user so
     people can build before signing up. Nothing works without this.
   - **Email → enable**, with "Confirm email" on. This is the account people
     upgrade *into*.
3. **Authentication → URL Configuration:**
   - Site URL: your Netlify domain (`http://localhost:3000` while developing).
   - Redirect URLs: add `<your-domain>/auth/callback` and
     `<your-domain>/auth/reset`. Add `http://localhost:3000/**` too so local
     development works.
4. Copy the Project URL and the `anon` key from **Project Settings → API**.

> **Email delivery.** Supabase's built-in SMTP is rate-limited to a handful of
> messages an hour and is explicitly not for production — confirmation and
> password-reset emails will silently stop arriving. Set your own SMTP under
> **Project Settings → Authentication → SMTP Settings** (Resend, Postmark and
> SES all work) before you launch.

> **Free tier warning.** Free Supabase projects pause after a period of
> inactivity. An invitation published in March for a wedding in September will
> sit untouched for weeks, and a paused project means a dead link. Use a paid
> tier for anything real.

## 2. Apply the schema — *you*

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste `supabase/migrations/20260810120000_init.sql` into the SQL editor.

It creates `invitations`, `rsvps`, `guest_messages` and `rate_limits`; the
indexes; the `set_owner` and `updated_at` triggers; every RLS policy; the
`is_slug_available` and `rsvp_summary` functions; and the three public storage
buckets with per-user write scoping.

### Verify it

The policies ship with an adversarial test suite. Run it before you trust it:

```bash
npx supabase db reset          # local stack
psql "$DATABASE_URL" -f supabase/tests/rls.test.sql | grep -E 'PASS|FAIL'
```

All 22 lines must read PASS. They currently do — see `supabase/tests/README.md`
for how to run it against a throwaway Postgres with no Supabase account.

## 3. Deploy the Edge Function — *you*

RSVPs and guest-book notes are the only writes a stranger can make, so RLS
grants anonymous users **no INSERT at all**. They go through this function
instead, which checks the invitation is published, throttles per IP, optionally
verifies a Turnstile token, and only then writes with the service-role key.

```bash
npx supabase functions deploy submit-response

npx supabase secrets set ALLOWED_ORIGINS="https://your-site.netlify.app"
# optional, for captcha:
npx supabase secrets set TURNSTILE_SECRET_KEY="0x..."
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

**If you skip this step, RSVP and the guest book will fail** — by design. The
service-role key must never reach the browser, so there is no fallback path.

## 4. Deploy to Netlify — *you*

Connect the repo. `netlify.toml` already sets the build command, Node 20, the
Next.js runtime plugin, and security headers.

Set these under **Site configuration → Environment variables**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon key |
| `NEXT_PUBLIC_SITE_URL` | your final domain |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | optional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional |

Both Supabase values are meant to be public — the anon key grants nothing on its
own because every table is behind RLS.

**Never set `SUPABASE_SERVICE_ROLE_KEY` on Netlify.** It belongs only in
Supabase secrets, read by the Edge Function. Anything prefixed `NEXT_PUBLIC_`
is compiled into the JavaScript bundle and readable by everyone.

## 5. Point Supabase back at Netlify — *you*

**Authentication → URL Configuration → Site URL**: your Netlify domain, plus
`https://*.netlify.app` under redirect URLs if you want deploy previews to work.

Then re-run step 3's `ALLOWED_ORIGINS` with the final domain, so the Edge
Function's CORS headers match.

---

## Smoke test after deploying

Work through these on the live site. They cover every path that changed:

1. **Create** — `/create`, pick a design, fill steps 3–6. The header should show
   "Saved" within a second. Reload; your work is still there.
2. **Upload** — add a cover image at step 2. It should land in Supabase
   Storage under `covers/<your-user-id>/…` (check the dashboard).
3. **Publish** — step 14. Claim a slug; it should report "Available", then
   publish cleanly. If you see the amber "this link only works in this browser"
   box, your env vars did not reach the build.
4. **Share** — open the link **in a different browser or on your phone**. This
   is the flow that was impossible before. It must render without a spinner.
5. **Preview** — paste the link into WhatsApp or Slack. You should get a title,
   description and, if you set a cover, an image.
6. **RSVP** — reply as a guest from that other browser. Then open
   `/my-invitations` as the host: the head count must include the reply. If it
   doesn't, the Edge Function is not deployed.
7. **Guest book** — leave a note on one device; it should appear on the other
   within a second or two, via Realtime.
8. **Rate limit** — submit nine RSVPs quickly. The ninth should be refused.
9. **Isolation** — in a private window, try `/my-invitations`. It must be empty:
   that browser is a different anonymous user.
10. **Claim an account** — build something, then at publish use "Save my work".
    You should get a confirmation email; clicking it keeps the *same* user id,
    so the invitation you just made is still listed. Check
    **Authentication → Users**: the row should flip from anonymous to your email
    rather than a second user appearing.
11. **Sign in elsewhere** — on another device, sign in with that email. Your
    invitations and their replies should be there.
12. **Password reset** — use "Forgot your password?", open the emailed link, set
    a new one. You should land signed in on `/auth/reset` and be able to continue.

## Things worth knowing

**Existing local invitations migrate themselves.** Anyone who used the app
before the backend existed gets their invitations lifted out of IndexedDB on
first load, media and all (`lib/migrate.ts`). The local copies are left in
place, so a half-failed upload can be retried.

**Accounts are optional but recoverable.** A visitor starts anonymous and can
publish without signing up. At publish they're offered an account, and the
upgrade happens in place — Supabase keeps the same `user.id`, so nothing has to
be migrated and the RLS policies (which key off `owner_id`) are untouched.

Until someone claims an account their session *is* the only key to their
invitations, so the UI refuses to sign an anonymous user out, and warns before
signing in on a device that has unclaimed work on it.

**No Content-Security-Policy is set.** Next.js emits inline bootstrap scripts,
so a correct policy needs per-request nonces via middleware. Adding one blind
would either break the app or be security theatre — worth doing once you can
test against the real deploy.

**Guest data is now on a server.** You are holding names and email addresses,
so GDPR applies. Hosts can already delete an invitation, which cascades to
every reply and note. A per-guest deletion route is the obvious next addition.
