# Deploying Invitra

Invitra uses a hosted Next.js website and Supabase for Auth, Postgres, Storage
and guest-response Edge Functions. All saved invitation and guest data belongs
in Supabase. The app does not fall back to browser storage when configuration
is missing.

## Current verification status

The linked Supabase project is configured for the local frontend in ignored
`.env.local`. On 2026-10-16, real Auth/table/RPC/guest-function connection checks
passed, an existing invitation opened without login in two fresh browsers, and
a newly confirmed test account signed in successfully. Email confirmation was
required and enforced by Auth.

The account-restriction migration has now been applied and checked against the
real project: the registered-account helper accepts the confirmed test user,
and both plain public-key and anonymous-session publish attempts are denied
with `42501`. No probe invitation rows were created.

Real browser checks also verified cover upload, cloud saving/publishing, guest
RSVP and guest-book records, host management and resuming the same invitation
from another signed-in browser. Full HD evidence is under
`test-videos/live-supabase-authenticated`. Disposable test invitations were
retained for review. One anonymous policy-test user was also created; its ID
is saved as `SUPABASE_ANONYMOUS_TEST_USER_ID` in ignored `.env.local` for later
cleanup through the Supabase dashboard.

These local checks do not establish that a public frontend deployment has the
same code or configuration. The steps below configure and verify that deployment.

## 1. Configure a Supabase project

If you are using the already verified Supabase project, skip creating another
project or reapplying migrations. To deploy only the frontend:

1. Commit and push the current source changes to GitHub. Keep `.env.local` and
   all test account credentials out of Git.
2. In Netlify, import the `muhmamadkamran/invatria` repository. The existing
   `netlify.toml` sets `npm run build`, publish directory `.next`, and Node 24.
   Netlify supports this Next.js App Router application through its adapter:
   [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).
3. Set these three Netlify variables before the production build, available to
   Builds and Functions: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`. Copy only the
   public URL/key values from `.env.local`; set the site URL to the final
   HTTPS origin, for example `https://YOUR_SITE.netlify.app`.
4. In Supabase Authentication URL Configuration, set the Site URL to that
   origin and add its exact `/auth/callback` and `/auth/reset` redirect paths.
5. In Supabase Edge Function secrets, update `ALLOWED_ORIGINS` to the exact
   HTTPS frontend origin, without a trailing slash. To keep local testing,
   use `https://YOUR_SITE.netlify.app,http://localhost:3000`. This app's CORS
   parser uses exact origins; wildcard subdomains are not supported.
6. Deploy/rebuild the frontend, then verify signup/email confirmation, login,
   publishing, an incognito share link, RSVP and guest-book replies on the
   deployed domain. Confirm custom SMTP is configured for public signup:
   [Supabase SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp).

The existing invitation slug stays the same: a live link is
`https://YOUR_SITE.netlify.app/i/<slug>`. Previously copied localhost URLs do
not automatically change into public links.

Node 24 matches the locally tested runtime and is an LTS release; Node 20 is
end-of-life. See the [Node.js release status](https://nodejs.org/en/about/previous-releases).

The following detailed setup sections are for a new project or for checking
individual settings on the existing project.

Create a project and enable the Email authentication provider. Enable email
confirmation for account verification. The app requires an email account to
open the builder, save, upload or publish; anonymous sign-ins are not required and should be
disabled for a new project.

Under Authentication URL Configuration, set your public website as the Site
URL and allow these redirects:

```text
https://YOUR_SITE/auth/callback
https://YOUR_SITE/auth/reset
```

For local development, also allow your actual development origin and those
paths, for example `http://localhost:3000/auth/callback` and
`http://localhost:3000/auth/reset`. Configure email delivery for confirmation
and password-reset messages, then test it with an account you control.

Copy the Project URL and public project key from the project API settings.
Add them to `.env.local` for local work:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_PROJECT_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never put a service-role key in a `NEXT_PUBLIC_` variable or client code.

## 2. Apply every database migration

With the Supabase CLI installed:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Apply **all** files under `supabase/migrations` in filename order. If using the
SQL editor instead of the CLI, execute every migration there in that order.
The original schema alone does not include later account restrictions.

The migrations create invitations, RSVPs, guest messages, rate limiting,
database functions, row-level security and Storage buckets. Confirm that they
finished successfully in your project. Run the SQL policy checks described in
[supabase/tests/README.md](supabase/tests/README.md) against a test project;
read the suite's setup instructions before running it.

## 3. Deploy the guest-response function

Guests submit RSVPs and guest-book messages without accounts. Their writes go
through `submit-response`; the browser cannot insert directly into response
tables. The handler checks that an invitation is published, validates the
request and applies rate limiting before writing with its server-only key.

Deploy it as a public endpoint:

```powershell
supabase functions deploy submit-response --no-verify-jwt
supabase secrets set ALLOWED_ORIGINS="https://YOUR_SITE"
```

The public function must accept requests without a signed-in user's JWT.
Supabase documents this configuration in its
[function configuration guide](https://supabase.com/docs/guides/functions/function-configuration).
JWT verification is disabled only for this guest endpoint; database policies
and the handler's request checks still apply.

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the Edge
Function. Keep the service-role key out of the website environment.

If enabling Cloudflare Turnstile, configure both the function's
`TURNSTILE_SECRET_KEY` and the website's `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
Allow your development origin in `ALLOWED_ORIGINS` when testing locally.

## 4. Deploy the website

Connect the repository to Netlify. `netlify.toml` contains the Next.js build
configuration. Set these variables for the deployment **before building**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your public project key |
| `NEXT_PUBLIC_SITE_URL` | Your final HTTPS website origin |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional captcha site key |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Optional advertising client |

Rebuild after changing public variables. Update the Supabase Site URL,
redirect allowlist and function `ALLOWED_ORIGINS` to match the final domain.
Public variables are included in browser JavaScript; authorization comes from
the user's session and database policies.

## 5. Verify the live workflow

Use two independent browser contexts, such as a normal browser window and a
private window. Test with disposable invitations and accounts you control.

1. Before signing in, browse templates and sample invitation previews. Opening
   `/create` or My Invitations must request a signed-in account. No invitation
   content should be stored in IndexedDB or localStorage.
2. Sign up and confirm the email, then sign in. Create an invitation and wait
   for a successful cloud-save indicator. Verify its owner and data in the
   Supabase `invitations` table.
3. Upload a cover and music. Confirm the objects appear in Supabase Storage
   under your user's folder, then reload the builder and check the media.
4. Publish with a unique slug. Copy the public HTTPS `/i/[slug]` link and open
   it in the private window without signing in. Confirm the invitation and
   media render. A `localhost` link cannot test sharing to another device.
5. Submit an RSVP and a guest-book message from the private window. Verify
   the records in Supabase and the host dashboard. Guests must not be able to
   view the host's RSVP list or edit the invitation.
6. Sign into the same account in another browser. Confirm that its drafts,
   invitations and replies appear. Sign into a different account and confirm
   it sees only its own invitations in the dashboard.
7. Confirm that an unpublished invitation does not open through a public
   link. Confirm that unauthenticated or anonymous direct publish requests
   fail at the database as well as in the UI.
8. Test password reset, deletion, a failed network save and retry. Failed
   saves must show an error, and must not claim the draft is saved.

## Existing browser data

Historical `storage-local` and migration modules remain in the repository for
reference, but are disconnected from the app. Automatic import is disabled.
Old IndexedDB records are not deleted or silently assigned to the next person
who signs in. If older work needs recovery, implement a separate authenticated
import that verifies invitation and media uploads before removing any source
records.

Session cookies keep an account signed in and the theme preference may remain
in browser storage. Invitation content, media and guest responses are stored
in Supabase. A signed-in host's changes awaiting a cloud save live only in page
memory and are lost if the page reloads before the save succeeds.

## Media cleanup

Replacing or removing a photo or track updates its invitation reference when
the cloud save succeeds. Previous uploads remain in Supabase Storage so a
failed save or concurrent edit cannot destroy media still used by an invitation.
Unused replacement uploads currently require a separate server-side garbage
collection job; no automatic collection job is deployed by this repository.

Deleting an invitation commits the database deletion first, then attempts to
remove its owned media only when no remaining invitation in that account
references it. The check includes cover, gallery, music, story and family
images. Failed cleanup leaves cloud objects behind and does not undo or
misreport a successful invitation deletion.
