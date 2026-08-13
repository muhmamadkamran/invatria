# Invitra

Invitations worth opening.

A digital invitation studio: design an elegant, animated invitation in fourteen
guided steps, publish it to a link, and share it with as many people as you
like. Every feature is free. There is no pricing page, no subscription, no
trial, no watermark and no guest limit anywhere in the product — the only
revenue is a small number of clearly-labelled ads on the studio pages.

## Running it

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev                  # http://localhost:3000
```

Node 20+. Without Supabase credentials the app runs entirely on IndexedDB,
which is fine for UI work but means invitations only open on the device that
made them. With them, it uses the real backend.

**Deploying:** see [DEPLOYMENT.md](DEPLOYMENT.md).

## Architecture

```
User → Netlify (Next.js) → Supabase (Postgres + Auth + Storage + Edge Functions)
```

| Concern | Where it lives |
| --- | --- |
| Invitations | `public.invitations` — promoted columns + a `jsonb` body |
| RSVPs, guest book | `public.rsvps`, `public.guest_messages` |
| Photos, music | Supabase Storage, scoped to `<user-id>/…` |
| Ownership | Anonymous auth — still no sign-up |
| Public writes | `submit-response` Edge Function (rate limit + captcha) |
| Drafts, theme | Still the browser — correctly so |

`lib/storage.ts` is the only module the app talks to for persistence. It picks
between `storage-remote.ts` (Supabase) and `storage-local.ts` (IndexedDB) at
runtime, and loads the Supabase SDK lazily so marketing pages never pay for it.

Security policies have an adversarial test suite in `supabase/tests/` — 22
checks covering cross-tenant reads, `owner_id` spoofing, anonymous insert
attempts and storage folder scoping.

## What's here

| Route | What it is |
| --- | --- |
| `/` | Landing page — hero, 22 features, 6 designs, 18 occasions, the 14 steps, FAQ |
| `/templates` | The full collection, filterable by occasion |
| `/templates/[id]` | A **live** preview of that design — the real renderer, sample content |
| `/create` | The fourteen-step builder, with a live phone preview |
| `/i/[slug]` | A published invitation, as guests see it |
| `/my-invitations` | Drafts, live links, RSVP replies, guest-book notes, exports |
| `/demo` | A finished invitation end to end |

## The six designs

Each is a complete world — its own type stack, palette, ornament, background
motif and ambient motion, defined in one place in `lib/templates.ts`.

| Design | Palette | Motion |
| --- | --- | --- |
| Royal Gold | Black, gold leaf | Drifting gold dust, candle flames |
| Romantic Blush | Soft pink, rose gold | Falling petals, rising hearts |
| Moonlight Garden | Navy, silver | Twinkling stars, strung fairy lights |
| Floral Paradise | White, green, lavender | Drifting leaves, crossing butterflies |
| Modern Luxury | White, beige, gold | Slow blurred orbs, glassmorphism |
| Royal Mughal | Maroon, emerald, antique gold | Swaying lanterns, gold dust |

Adding a seventh means adding one entry to `TEMPLATES` — the renderer, the
gallery, the builder and the card preview all read from it.

## Occasions drive the content

An invitation is not a wedding with the words swapped, so `lib/occasions.ts`
holds a preset per occasion and everything else reads from it — the builder's
field labels, the invitation's wording, which sections start switched on, and
how the names are typeset.

Three name modes cover all eighteen:

| Mode | Used by | Renders as |
| --- | --- | --- |
| `couple` | wedding, nikah, walima, engagement, anniversary, mehndi, reception | Two names stacked around a join word, in the design's script face |
| `single` | birthday, baby shower, bridal shower, graduation, eid, ramadan, house warming, farewell | One name large, with an optional line beneath — "turns thirty", "Class of 2026" |
| `org` | corporate, business, school | Event title in the display serif, with the host company in small caps |

So picking **Birthday** gives you "Whose birthday is it?" with a *Birthday name*
and a *Milestone* field, an invitation reading "Please join us to celebrate /
Ayaan / turns thirty", no parents or wedding-party sections, and a guest book
titled "Birthday Wishes". Picking **Corporate Events** gives an event title, an
agenda instead of an order of the day, travel and FAQ sections, and no gifts.

Changing the occasion mid-build re-words anything you haven't personally
edited and leaves everything you have typed exactly as it is
(`applyOccasion`).

## How it's put together

```
app/                     routes (App Router, mostly static)
components/
  landing/               marketing sections
  invitation/            the renderer: envelope, sections, RSVP, guest book, QR
  builder/               the 14-step studio + live preview
  dashboard/             my-invitations
  fx/                    ambient effects (gold dust, petals, stars, lanterns…)
  ui/                    buttons, fields, toggles
lib/
  templates.ts           the six designs
  categories.ts          the eighteen occasions
  occasions.ts           per-occasion wording, sections and name mode
  features.ts            the twenty-two features
  steps.ts               the fourteen builder steps (shared with the landing page)
  storage.ts             IndexedDB persistence
  i18n.ts                seven languages, incl. RTL
  export.ts              PNG + PDF export
```

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · React Hook Form + Zod · Lucide · idb-keyval · qrcode ·
html-to-image + jsPDF.

### Storage

Invitations, photographs, music, RSVP replies and guest-book notes are stored
in the visitor's own browser via IndexedDB (`lib/storage.ts`). That is what
makes the product free and account-less: there is no server to pay for and no
personal data leaving the device.

The consequence is honest and stated in the UI: an invitation opens on the
device that made it. `lib/storage.ts` is a single, narrow module — swapping it
for Firestore + Cloudinary means reimplementing about a dozen functions and
nothing else. Set `NEXT_PUBLIC_ADSENSE_CLIENT` to enable real ad units; without
it, the ad slots render a labelled placeholder.

### Accessibility

- Every scroll-triggered reveal goes through `Reveal` / `InvReveal`, which
  render their children plainly when `prefers-reduced-motion: reduce` is set.
  Content is never left invisible because an animation didn't run.
- All ambient particle layers carry `data-fx` and are removed wholesale by one
  CSS rule under reduced motion.
- Keyboard-only focus rings, a skip link, labelled form controls, `aria-pressed`
  on toggle buttons, and a `dir="rtl"` switch for Urdu and Arabic.

### Performance

Everything except the published-invitation route is statically prerendered.
The heavy export libraries (`html-to-image`, `jsPDF`) load on click rather than
on page load. Ambient effects are CSS-transform driven and seeded from a
deterministic PRNG, so they cost nothing per frame and never cause hydration
mismatches.

## Notes

Fonts are loaded from Google Fonts via a `<link>` in `app/layout.tsx` rather
than `next/font`, because the build environment had no outbound access to the
font CDN. If your build environment does, switching to `next/font/google`
self-hosts them and removes the extra connection.
