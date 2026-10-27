# Search readiness

Confirmed production origin: `https://invatria.netlify.app` (2026-10-27).
The Netlify build configuration now sets this origin explicitly. Local development
continues to use localhost. The live site was reachable with HTTP 200; robots.txt
allowed public crawling and linked a sitemap on the correct domain. The deployed
homepage and catalog had no canonical tags, so the local SEO fixes still require
deployment. A nonexistent live URL returned HTTP 404.

A single headless Chromium run at a 390 x 844 viewport measured homepage LCP
at 7.46 seconds and CLS at 0.0029. The catalog measured LCP at 1.55 seconds and
CLS at 0.0009, but contained no H1. Both advertised `index, follow`. These are
single-run lab observations from this machine, without mobile network/CPU
throttling, and are not field Core Web Vitals. The homepage does not meet the
requested two-second target in this observation. Repeat testing after deploying
the local changes before claiming improvement.

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

1. Set `NEXT_PUBLIC_SITE_URL` on the production host to the real HTTPS origin.
   The local `.env.local` currently uses `http://localhost:3000`; this is correct
   only for local development. Canonicals and sitemap entries depend on this value.
2. Add the site as a property in Google Search Console. For URL-prefix HTML-tag
   verification, set `GOOGLE_SITE_VERIFICATION` to the token from Google, rebuild,
   and verify ownership. Domain properties require Google's DNS verification.
3. After deploying, inspect `/robots.txt` and `/sitemap.xml`. Submit `sitemap.xml`
   in the verified property's Sitemaps screen, then inspect the homepage and
   templates page with URL Inspection. Submission is not completed by this code.
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
measurements. No verified person or author biography has been supplied. Add a
factual biography once the site owner supplies it. Content cannot reliably be
classified as AI-written from its wording; review specific inaccurate, generic,
or unsupported claims rather than deleting useful pages indiscriminately.

Editorial backlinks require the publications' independent decisions. There are
no guaranteed placements or ranking deadlines, and no outreach has been sent.
