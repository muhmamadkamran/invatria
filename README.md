# Invitra

A digital invitation studio with fourteen guided steps, live previews, public
invitation links, RSVP management and a guest book.

## Setup

Use Node.js 24 LTS. Install dependencies and create `.env.local` in the
project root with your own Supabase project values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_PROJECT_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```powershell
npm install
npm run dev
```

If this Windows environment cannot launch `npm.cmd`, existing dependencies can
be used directly:

```powershell
node node_modules/next/dist/bin/next dev
```

The linked project is configured locally in ignored `.env.local`. Real Auth,
table, slug-function and guest-function connection checks passed on 2026-10-16.
An existing real invitation opened through the local frontend in two fresh
browsers. A confirmed test account completed cloud upload, save, publish,
guest RSVP/note submission, host management and same-account access from an
independent browser. The account-restriction migration is applied: confirmed
accounts pass its helper, while public-key and anonymous-session publish
attempts were rejected by the real database with `42501`.
See [DEPLOYMENT.md](DEPLOYMENT.md) for setup and live validation.

For a local frontend connected to your real Supabase project, copy
`.env.example` to `.env.local`, enter the public project URL/key, and run:

```powershell
node scripts/check-supabase.mjs
node node_modules/next/dist/bin/next dev
```

To check an existing published invitation from two fresh browsers against the
real project, without creating or changing records:

```powershell
node scripts/check-supabase-browser.mjs --headed
```

This uses a separate local frontend on port 3300 and records Full HD videos in
`test-videos/live-supabase`. It verifies public viewing and the login gate;
authenticated publishing requires a confirmed test account.

The connection check reads Auth settings, schema/RPC availability and public
guest-function validation/CORS. It does not create invitations or test account
login, Storage uploads or database policies. The browser regression suite uses
an isolated mock backend; passing it does not verify your live project.

With a confirmed disposable account configured as `SUPABASE_TEST_EMAIL`,
`SUPABASE_TEST_PASSWORD` and optionally `SUPABASE_TEST_USER_ID` in `.env.local`,
the real authenticated workflow can also be run:

```powershell
node scripts/check-supabase-authenticated.mjs --headed
```

This creates and retains a clearly named test invitation, uploads a cover, and
submits test guest replies. It uses the actual local frontend origin allowed by
the project's guest function (default `http://localhost:3000`), so keep that
port free. Full HD host/guest recordings are saved under
`test-videos/live-supabase-authenticated`.

## Saving and sharing

Invitations, drafts, media, RSVPs and guest-book messages use Supabase only.
There is no IndexedDB fallback. Browse designs and sample invitations without
signing in. The builder, saving, uploading and publishing require a signed-in
email account. Confirm your email before continuing. If the backend is not
configured, the builder shows that online saving is unavailable.

Changes awaiting a successful cloud save exist only in page memory. A failed
save is shown as an error; reloading before saving loses those changes.

A published `/i/[slug]` link is public: guests can view it and respond without
signing in. The website must be deployed at a public address for other people
to open it; a `localhost` link points at the guest's own computer. Supabase
credentials must be present when the deployment is built.

Authentication uses session cookies so users can stay signed in. Theme
preferences may be stored in the browser; invitation content and replies are
not. Historical IndexedDB and migration modules are disconnected from the
active app. Older browser data is not automatically imported or deleted.

## Architecture

```text
Browser -> Next.js website -> Supabase Auth + Postgres + Storage
Guest response -> submit-response Edge Function -> Postgres
```

| Concern | Storage |
| --- | --- |
| Accounts and ownership | Supabase Auth |
| Invitations and drafts | `public.invitations` |
| RSVPs and guest messages | `public.rsvps`, `public.guest_messages` |
| Photos, video and music | Supabase Storage |
| Guest submissions | `submit-response` Edge Function |
| Changes awaiting cloud save | React state in memory |

`lib/storage.ts` exposes the cloud persistence contract. Row-level security
protects owner actions; published invitation content remains public for
guests. Apply every migration in `supabase/migrations` in order, including the
account requirements, rather than applying only the original schema.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and FAQ |
| `/templates` | Designs filtered by occasion |
| `/templates/[id]` | Sample invitation preview |
| `/create` | Fourteen-step builder |
| `/i/[slug]` | Published invitation for guests |
| `/my-invitations` | Signed-in host's drafts, invitations and replies |
| `/demo` | Sample finished invitation |

The six designs and eighteen occasion presets are defined in
`lib/templates.ts` and `lib/occasions.ts`. The renderer, builder and previews
share those definitions. The app supports seven languages, including
right-to-left Urdu and Arabic, PNG/PDF exports, QR codes and reduced motion.

## Browser testing

```powershell
node node_modules/@playwright/test/cli.js test
```

To watch the browser and retain Full HD recordings:

```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.watch.config.ts
```

Recordings go to `test-videos`. See [the testing guide](tests/e2e/README.md) for
coverage and setup. Local browser tests can validate UI behavior and simulated
backend responses; they do not prove that a real Supabase deployment is
configured. Run the deployment checks against your own project as well.

The stack is Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion and
Supabase, with `html-to-image` and jsPDF loaded for exports.
