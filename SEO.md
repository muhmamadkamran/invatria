# Current address: https://invitra-ai.netlify.app

The owner renamed the Netlify hostname from invatria.netlify.app. The new live
site was reachable, but its canonical and sitemap still referenced the old
host, which returned 404. The repository configuration is now corrected.
See [migration/README.md](migration/README.md) for publishing, Search Console,
Supabase settings and the prepared old-host redirect package. Earlier live
observations below refer to the previous hostname unless noted otherwise.

# Search readiness

## Branded-search diagnosis

The owner searched for `Invatria` and chose to retain `Invitra` as the public
brand, with `Invatria` as an alternate. The live check returned HTTP 200 for the
homepage, allowed indexing and crawling, and served the Google verification
file. It still displayed the older homepage title and returned HTTP 404 for
`/invitations`, showing the latest local SEO expansion was not deployed.

The local homepage now identifies the primary name `Invitra` and alternate
`Invatria` through WebSite and Organization JSON-LD, a brand-first title,
description, visible footer text and the About page. The primary logo spelling
is unchanged. This implements Google's site-name preference mechanism; it does
not establish that Google has indexed or ranked the site.

The earlier Search Console screenshot was a live test saying the URL *can* be
indexed. The Google Index tab's actual status and exclusion reason are still
required to diagnose indexing. Search-result absence or a `site:` query alone
cannot settle that question.

Publish the current changed and new files before triggering a redeploy. If
Netlify is connected to GitHub, commit and push the updated source to the linked
branch; redeploying an older commit will not publish local uncommitted changes.
After publication, `/invitations` must return 200 and the homepage source must
contain WebSite structured data with `alternateName` including `Invatria`.
Then inspect the homepage in Search Console, request indexing if appropriate,
and recheck the Google Index tab rather than treating another live test as an
indexing confirmation.

Site-name guidance: https://developers.google.com/search/docs/appearance/site-names

For the subsequent worldwide-English content expansion and current keyword/page
map, see `SEARCH-GROWTH.md`. It adds the invitation ideas hub and four occasion
pages, bringing the sitemap to 15 public URLs after deployment. The historical
live checks below predate that expansion.

Current production origin: `https://invitra-ai.netlify.app` (2026-10-27).
The Netlify build configuration sets this origin explicitly. Local development
continues to use localhost. After the owner's redeployment, all nine sitemap
pages returned HTTP 200 with a canonical tag, one H1, and `index, follow`.
The homepage includes WebApplication and FAQPage markup; the catalog, demo and
six template pages include BreadcrumbList markup. The catalog is available with
JavaScript disabled. Both a nonexistent top-level URL and an unknown template
returned HTTP 404. Robots.txt permits public crawling and references the correct
sitemap. No Google HTML verification token was present in the checked pages;
this does not establish whether ownership has been verified by another method.

The latest single headless Chromium run at a 390 x 844 viewport measured:

| Page | LCP | CLS | Initial HTML response start |
| --- | --- | --- | --- |
| Home | 5.156 s | 0.0031 | 3.883 s |
| Templates | 1.424 s | 0.0009 | 0.377 s |

These are unthrottled, single-run lab observations from this machine, not field
Core Web Vitals. Neither page overflowed horizontally and no rendered image
lacked an alt attribute. The homepage still exceeds the two-second target.
Most of the delay occurred before receiving HTML. The font stylesheet took
another 0.81 s and blocked initial rendering. An automatically prefetched
editor response took 3.23 s and fetched editor-only bundles.

The next local changes defer the font stylesheet, disable speculative editor
and dashboard link prefetching on marketing pages, and use native FAQ details
so all answers remain in HTML and can be expanded without JavaScript. They also
shorten marketing descriptions and replace the unsupported perpetual-storage
FAQ claim with actual account-management instructions. These additional changes
require deployment and a new live measurement. They cannot promise a two-second
load while the host's initial response alone exceeds that budget.

The owner requested a profile based on the website rather than supplying a
personal biography. A factual Invitra publisher profile is now implemented at
`/about`, linked from the footer and author metadata, and included in the sitemap.
After deploying these additional changes the sitemap should contain ten pages.
No personal identity, credentials or endorsements have been invented.

The marketing pages are prerendered HTML, including the full template catalog.
Public routes have page-specific canonical URLs and descriptions. The catalog
and template previews are linked from the footer. Template previews and the demo
include visible breadcrumbs and BreadcrumbList markup. The homepage FAQ schema
uses the same question and answer data as the interactive FAQ.

Private invitation links, password reset, creation and account pages deliberately
remain outside search results. Do not remove these privacy restrictions to try
to improve marketing-page rankings. Unknown template IDs return a 404; do not
redirect every missing URL to the homepage. Redirect a retired URL only after
identifying its actual replacement.

## Production configuration and submission

The owner's Search Console screenshot specifies HTML-file verification using
`google317c274d2d702e08.html`. The matching verification file has been added under
`public/`. Deploy it, open
`https://invitra-ai.netlify.app/google317c274d2d702e08.html` and confirm it displays
`google-site-verification: google317c274d2d702e08.html`, then click Verify in
Search Console's HTML file section. Keep this file in future deployments.
The HTML-tag method below is an alternative and is not also required.

## Google live-test rendering repair

The owner reported React error 418 and a failed external Marcellus font request.
Development-mode reproduction confirmed a hydration mismatch when the browser
prefers reduced motion: the server emitted animated word spans and nonbreaking
spaces, while the first browser render emitted a plain-text heading. All motion
preference consumers now use a shared `useSyncExternalStore` hook with a stable
server snapshot. The initial client render matches the server, then subscribes
to the actual browser preference, including changes while the page is open.

The seven existing font families are now self-hosted under `public/fonts`, with
their OFL license files. `/fonts/invitra.css` references only local WOFF2 URLs;
the layout no longer contacts Google Fonts or fonts.gstatic.com. The stylesheet
continues loading after hydration with the existing no-JavaScript fallback.
Run `node scripts/vendor-fonts.mjs` only when intentionally refreshing the font
assets; regular builds do not need access to Google's font servers.

These repairs require deployment before repeating Google's live URL test.
Validation passed: production build, TypeScript, ESLint and two production
browser regression tests. Each browser test visits home, templates, demo and
about with either reduced or normal motion, checks for JavaScript/hydration
errors, and loads Marcellus from the local font assets without Google requests.

1. Set `NEXT_PUBLIC_SITE_URL` on the production host to the real HTTPS origin.
   The local `.env.local` currently uses `http://localhost:3000`; this is correct
   only for local development. Canonicals and sitemap entries depend on this value.
2. Add the site as a property in Google Search Console. For URL-prefix HTML-tag
   verification, set `GOOGLE_SITE_VERIFICATION` to the token from Google, rebuild,
   and verify ownership. Domain properties require Google's DNS verification.
3. After deploying, inspect `/robots.txt` and `/sitemap.xml`. Submit `sitemap.xml`
   in the verified property's Sitemaps screen, then inspect the homepage and
   templates page with URL Inspection. Submission is not completed by this code.
   Use the URL-prefix property `https://invitra-ai.netlify.app/`. The exact sitemap
   address is `https://invitra-ai.netlify.app/sitemap.xml`.
4. Inspect the deployed host/CDN for password protection, bot challenges,
   `X-Robots-Tag`, and HTTP errors. Repository checks cannot verify hosting rules.
5. Measure mobile LCP and CLS on the live domain with PageSpeed Insights and
   Search Console. A local build does not establish a two-second real-world load.

## Media and content

Supported public Supabase and Unsplash photos use Next's image optimizer, which
negotiates AVIF/WebP with the browser. Original uploads are retained. Gallery
containers reserve their aspect ratio; decorative cover images keep empty alt
text, while content photos use captions or a numbered fallback. For useful
descriptions, hosts should supply captions that describe the actual photo.
Existing local artwork is SVG and does not need raster conversion.

The homepage headline renders visibly without waiting for its entrance animation;
ads load after the window load event. Further performance work should follow live
measurements. An organization publisher profile has been added as described
above. Content cannot reliably be
classified as AI-written from its wording; review specific inaccurate, generic,
or unsupported claims rather than deleting useful pages indiscriminately.

Editorial backlinks require the publications' independent decisions. There are
no guaranteed placements or ranking deadlines, and no outreach has been sent.

Ownership verification instructions: https://support.google.com/webmasters/answer/9008080
Sitemap submission instructions: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
