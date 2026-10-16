# Browser tests

The suite exercises the actual UI with isolated browser storage for every test.
It starts its own Next.js server on port 3100 and a disposable Supabase HTTP
contract double on a random localhost port. Both server-rendered and browser
requests reach that same in-memory backend. The setup explicitly overrides
Supabase URL/key, CAPTCHA and ads; it never connects to the developer's real
database or inherits live credentials from `.env.local`.
Keep port 3100 free; a running application server is never reused.
Test compilation uses `.next-playwright-<port>` so an existing developer/UI
server cannot overwrite the test server's Next.js manifests.
A separate ignored `.tsconfig-playwright-<port>.json` keeps Next's generated
type-path changes out of the main TypeScript configuration.
The setup launches Node directly, so Windows installations without `cmd.exe`
are supported. In UI mode, run the global setup task if the server is not
already started, then run the tests.

```sh
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

On Windows PowerShell with disabled script execution, use `npm.cmd` instead of
`npm`. If that wrapper is unavailable, use:

```powershell
node node_modules/@playwright/test/cli.js test
```

If an older test server occupies port 3100, choose another port without stopping
it:

```powershell
$env:PLAYWRIGHT_PORT = '3200'
node node_modules/@playwright/test/cli.js test
```

## Visible automation and video

```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.watch.config.ts
```

This runs all desktop and mobile scenarios one at a time in a visible browser,
on port 3101 with a 250ms delay between browser actions. Each test gets its own WebM video
in `test-videos/<test-name>/video.webm`, including tests that pass. Recordings
capture the browser page, without microphone or desktop audio.
Recordings use Full HD (1920 x 1080); desktop tests also use a matching viewport.
Mobile tests keep their phone viewport inside the Full HD recording canvas.
The HTML report
also links to each recording. The next watch run replaces these recordings;
copy videos elsewhere if you want to keep them.

For just the complete invitation workflow:

```powershell
node node_modules/@playwright/test/cli.js test --config=playwright.watch.config.ts --project=chromium --grep "fourteen steps"
```

There are 20 scenarios, each run in desktop Chromium and mobile Chrome:

- Landing page, FAQ interaction and persisted light/dark preference.
- All 18 occasion filters, checked against the design collection.
- Each of the six template previews and its builder selection.
- Empty dashboard and recovery from an unknown invitation link.
- All 14 builder steps, edited names/date/time/venue, autosave after reload,
  publishing, opening the invitation, RSVP validation/submission, guest-book
  submission, host reply management and PNG/PDF downloads.
- Occasion/language selection and preservation of a custom name.
- Mandatory account gate for signed-out visitors, with no invitation writes.
- Consumed signup links offer sign-in instead of sending users to password reset.
- Signup awaiting email confirmation before editing or cloud saving is unlocked.
- Owner-only dashboard rows, including when another account has published work,
  and explicit cloud draft links for editing.
- Private draft public URLs unavailable to the owner and to a fresh guest browser.
- Autosaved work resumed after sign-in in a separate browser context, with no
  invitation documents in localStorage or IndexedDB.
- Failed cloud saves display an error without falling back to browser storage.
- Publishing remains live after a slow cloud write and immediate editor exit,
  without an older draft save reverting the published state.
- A cover photo persists as a remote Storage URL, its bytes can be fetched by
  an unauthenticated guest, and a failed replacement leaves the saved photo intact.

Failures retain screenshots and traces in `test-results`; the HTML report is
written to `playwright-report`. Reports are ignored by Git.

The complete publish workflow signs in through the real app dialog, publishes
to the contract double, then opens the share link in a separate browser context
without the host's cookies. The guest submits RSVP and a note; the host sees
both on the dashboard. Each account has a unique email and each published slug
is unique, so parallel tests cannot accidentally pass using another test's work.

These are isolated cloud-path UI regression tests, not live Supabase integration
verification. The double models Auth, PostgREST ownership/public reads, slug
availability, RSVP summaries, binary Storage uploads and the submission function's HTTP contract. It
does not execute PostgreSQL RLS/SQL triggers, the deployed Edge Function,
CAPTCHA, email delivery, Realtime, real Storage policies, actual audio playback, or
every optional builder section. Backend policy tests live in `supabase/tests`.
Before claiming real cross-device publishing works, configure a real Supabase
project, apply migrations/deploy the function, and verify the signed-in publish
and signed-out share flow against that project separately. Browser execution
must pass before considering these isolated flows verified; TypeScript checking
alone does not establish that the tests pass.

Configuration reference: https://playwright.dev/docs/test-configuration
