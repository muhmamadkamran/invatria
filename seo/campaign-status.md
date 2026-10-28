# Invitra campaign status

Prepared: October 28, 2026, Asia/Karachi.
Production origin: https://invitra-ai.netlify.app/
Audience: worldwide English searches.

The campaign now has a live technical baseline, source changes, a 240-phrase
candidate bank, a useful wording tool and reviewable promotion drafts. These are
separate from measured search results. Current Google indexing, impressions,
clicks, rankings, independent AI recommendations and invitation conversions have
not been established by the available campaign data.

## Evidence and limits

The saved [public audit](baselines/2026-10-27-public-audit.json) was recorded at
`2026-10-27T13:24:06.785Z`, or October 27 at 6:24 PM in Pakistan. It is a point-in-time
HTTP and browser observation, not a current Search Console export or a Google
ranking report. The browser observations were each a **single unthrottled run**
at a 390 x 844 viewport with a 1.5-second post-load window. They are not field
Core Web Vitals or evidence of performance for all users.

| Live observation in that audit | Result |
| --- | --- |
| Public sitemap pages checked | 15; all returned HTTP 200 |
| Public canonical and robots metadata | Correct production-origin canonicals; `index, follow` observed |
| H1 count | One on each of the 15 pages |
| `/robots.txt` | HTTP 200; public crawling allowed; invitation, creation, account and auth paths excluded |
| `/sitemap.xml` | HTTP 200; correct production host |
| Optional `/llms.txt` | HTTP 404 in that deployed version |
| Social metadata | 15 missing preview-image warnings; 4 incorrect page-specific Open Graph URLs |
| Browser console | React hydration error #418 recorded on the homepage and catalog |
| Mobile layout observations | No horizontal overflow; no rendered image missing an `alt` attribute on the two browser-tested pages |

| Page | LCP | Initial HTML TTFB | CLS |
| --- | --- | --- | --- |
| `/` | 4.444 seconds | 3.334 seconds | 0.00466 |
| `/templates` | 2.352 seconds | 0.571 seconds | 0.00445 |

The two-second loading objective is not verified. The homepage's slow initial
response and the browser hydration errors are concrete follow-up items. The
audit's HTTP summary reports zero errors, but that does **not** mean the browser
console was error-free. User-agent-string requests also do not prove access from
Google's or an AI provider's actual crawler infrastructure.

The owner's October 27 Search Console screenshots showed a successfully
processed sitemap with 15 discovered URLs, an earlier homepage status of
“URL is unknown to Google,” and an indexing-request quota message. Those are
historical screenshots, not confirmation of today's indexing status. Sitemap
discovery does not establish that the 15 URLs are indexed.

## Live pages versus current source work

The audit confirms that the homepage, catalog, demo, About page, occasion hub,
four occasion guides and six template pages existed in the deployed version.
The following current workspace changes must be built, tested, deployed and
checked on the live origin before being reported as published:

| Source work | Implementation and verification required |
| --- | --- |
| Server-rendered text visibility | Hero, shared reveal effects and invitation sections no longer rely on invisible text or blur gates. Production visibility tests inspect headings, design cards and actions without JavaScript. Recheck hydration under both motion preferences before deployment. |
| Shared social image | `public/images/invitra-share.png` and `.svg` are original product illustrations. Shared metadata supplies the image and page-specific Open Graph URL. Check image HTTP 200, absolute production URLs and tags after deployment. |
| Clear product identity | Shared visible facts, WebApplication schema and connected website/organization entities describe real pricing, host accounts, guest access and features. No personal author credentials have been invented. |
| AI search readability | Explicit public rules for search crawlers and an optional `/llms.txt` summary are implemented in source. They require deployment; the baseline version still returned 404 for the summary. No independent AI recommendation has been demonstrated. |
| WhatsApp wording tool | New route `/tools/whatsapp-invitation-message`, with a free browser-based message builder, occasion-specific wording, optional HTTPS invitation link, copy action and user-controlled WhatsApp opening. It is linked from the footer and occasion hub. |
| Sitemap | Source adds the wording tool, increasing expected public entries from 15 to 16 after deployment. Confirm the deployed file rather than assuming Search Console has discovered the new route. |

The wording tool does not need an account to prepare text. It is a template-based
local composer, not a verified AI text-generation feature. Hosts still need a
free account to save and publish an Invitra invitation with online RSVP. The user
chooses recipients and sends the message in WhatsApp; the tool does not perform
automatic sends or report delivery/read receipts.

Production checks and live checks have different purposes. Local tests can
validate implementation; they cannot confirm indexing, rankings or deployed
behavior. Record the final passing checks and deployed commit when those steps
actually occur. No production deployment is recorded in this status document.

### Completed implementation checks

- Optimized production build, TypeScript and focused ESLint checks passed.
- All 20 distinct production regressions passed across the full run and focused
  reruns, including both motion preferences, the Netlify head insertion,
  JavaScript-disabled visibility and fonts, public invitation rendering,
  discovery/schema, template headings, message composition/copy/share and social
  metadata. Sharing tests inspect the destination; they do not send messages.
- A read-only HTML audit of all 16 routes on the local production build found
  zero errors and zero warnings for the fields checked by the audit script.
  It checked actual production canonicals using `--canonical-origin`.
- Differential replay of live HTML isolated React #418 to the newline that
  Netlify inserts before its hosting comment. Removing only that newline fixed
  hydration; removing only the appended HUD script did not. The source repair
  moves the no-JavaScript font fallback out of the head and retains deferred
  stylesheet loading. The regression reproduces that hosting transformation.

Repeat the public audit after deployment:

```sh
node scripts/audit-public-seo.mjs --browser --output .tmp/seo-audit.json
```

To check a local production build with the production canonical origin, use
`--origin http://127.0.0.1:PORT --canonical-origin https://invitra-ai.netlify.app`.
The browser measurements remain lab observations; HTTP checks do not establish
Google index status or independent AI recommendations.

## Search targets and coverage

The [keyword CSV](keyword-research.csv) contains **240 unique candidates across
16 clusters**, confirmed by parsing the file. Search volumes and difficulty have
not been independently verified. This is a topic and intent map, not 240 ranking
results or 240 dedicated landing pages. Do not create near-duplicate pages for
every wording variation.

| Intent | Relevant page | Current evidence |
| --- | --- | --- |
| Brand: Invitra, Invatria | `/`, `/about` | Brand identity and alternate spelling are in public copy and schema; actual brand-query impressions still need Search Console data. |
| Online invitation card maker with RSVP | `/` | Live page observed; broad competitive intent, not verified search volume. |
| Invitation card templates | `/templates` and six design pages | Live pages observed; six designs. |
| Wedding invitations and wording | `/invitations/wedding` | Live page observed, with examples and useful planning content. |
| Birthday invitations and wording | `/invitations/birthday` | Live page observed. |
| Baby shower invitations and wording | `/invitations/baby-shower` | Live page observed. |
| Nikah invitations and English wording | `/invitations/nikah` | Live page observed. |
| WhatsApp invitation message and RSVP-link wording | `/tools/whatsapp-invitation-message` | Source implemented; pending production validation and deployment. Existing keyword bank is not represented as verified demand for this tool. |

Use real query data to choose the next improvements. More keywords alone do not
establish relevance, indexing or visitor engagement. Current coverage and
research assumptions are documented in [SEARCH-GROWTH.md](../SEARCH-GROWTH.md).

## Promotion state and owner prerequisites

The [promotion kit](promotion-kit.md) contains factual listings, a maker launch
comment, a designated community reply, a 329-word editorial draft and a planner
enquiry. The [opportunity CSV](promotion-opportunities.csv) records five priority
routes, two secondary prospects and three exclusions/deferrals.

The owner has approved **Invitra** as the public sender/publisher name and
byline. Drafts now use that organization voice, with a factual publisher bio
drawn from the site's About page. That approval does not establish a personal
maker identity, business email, platform account or authorization to send.

**No submissions, outreach messages, public posts, payments or acquired links
have been recorded.** The review-ready priority routes are:

1. WeddingDetails' free vendor listing: actual form review and approved business
   contact/location fields needed; staff approval applies.
2. Product Hunt: real personal maker account, onboarding, screenshots, logo and
   tested demo needed; launch draft and first comment are prepared.
3. AlternativeTo: verified account, correct software licence, listing details
   and screenshots needed; the free queue has no promised review date.
4. The r/DesiWeddings vendor directory's Wedding Invitations category: real
   account/affiliation/contact and an open thread needed. Ordinary subreddit
   promotional posts have stricter restrictions.
5. Brides & Weddings editorial form: Invitra publisher bio is prepared; confirm
   acceptance of an organization byline. A real human author and factual bio
   remain prerequisites if the publisher requires them. Contact, supporting
   image rights and final editorial review are still needed.

SaaSHub and BetaList exclude free hosting subdomains such as the current Netlify
address; BetaList also requires payment. Show HN has additional product-fit
conditions and prohibits AI-written or automated posts. Do not submit drafts
there. These exclusions are documented with official sources in the kit.

Remaining owner-specific inputs are **an approved business email/contact,
correct licence and relevant authenticated accounts**. The public brand name
and publisher bio are no longer missing. A real personal maker account is still
required by Product Hunt; supply a real human author/name/bio only if the
editorial or contact platform requires one. Do not create a fictitious person
or a prohibited brand account to bypass platform rules. Never fabricate facts,
ask for passwords, imply an existing partnership, or promise editorial approval.
Prepare the final exact text and assets before seeking authorization for the
particular submissions/messages. Account verification and CAPTCHA may require
the owner to complete a step.

## Data needed from Search Console

Use the URL-prefix property **`https://invitra-ai.netlify.app/`**, not the previous
hostname. The public audit has no authenticated Search Console access. Supply
exports or use an authorized connected account to obtain the following:

- **Performance > Search results:** select Web search, all countries and all
  devices, enable clicks, impressions, average CTR and average position, and
  export the available recent 28-day period to CSV. Preserve Queries, Pages,
  Dates, Countries and Devices tables when included. If the property is too new,
  export the available period and record its exact dates instead of inventing a
  28-day baseline. Export the available prior comparison period separately.
- **Indexing > Pages:** export the report's summary and indexing reasons. Open
  important exclusion reasons and export their example URL tables if available.
  These example lists are not necessarily a complete URL inventory.
- **URL Inspection:** for the homepage and four occasion pages, record the
  **Google Index** result, last crawl, indexing exclusion reason if any, and
  user-declared/Google-selected canonical when reported. Save the report date.
  A Live Test showing indexability is a separate check.
- **Sitemaps:** record the submitted URL, current status, last-read date and
  discovered count. Inspect the deployed sitemap directly to confirm the new
  tool URL before expecting a count of 16 in the report.

Store exports with their property, report, date range and export date, for
example `invitra-ai-performance-2026-10-28.csv`. No credentials, private RSVP data
or guest lists are needed. Search Console Performance's **Pages tab** reports
search traffic; **Indexing > Pages** reports indexing. Both are needed because
they answer different questions.

Official guidance: [Performance reports](https://support.google.com/webmasters/answer/7576553),
[Page indexing](https://support.google.com/webmasters/answer/7440203), and
[field Core Web Vitals](https://support.google.com/webmasters/answer/9205520).

## Priority actions and measurement cadence

### Before the next deployment

1. Finish production build, lint/type checks and meaningful regression tests
   for server-visible content, hydration, metadata and the wording tool. Resolve
   any remaining hydration error rather than treating HTTP 200 as sufficient.
2. Preserve the baseline, identify the exact deployment commit and publish the
   tested source. Do not redeploy an old commit and assume local changes are live.
3. Verify the new tool, its copy/share flow, social image, correct page-specific
   metadata, public product facts, crawler policy and the 16-entry sitemap on the
   live origin. Recheck a genuinely missing URL returns 404.
4. Repeat comparable browser measurements and record conditions. Investigate
   slow initial HTML separately from rendering effects. Do not infer a two-second
   global load time from one faster local or hosted run.

### First seven days after the confirmed deployment

- Establish the actual indexing and performance baseline from owner exports.
  If Google lists a genuine exclusion, fix that specific reason; avoid repeating
  indexing requests or resubmitting an unchanged successful sitemap.
- Prioritize the homepage, four occasion pages and new tool for inspection.
  Request indexing once where appropriate and available; respect any quota.
- Finalize missing contact details, platform-specific identities, accounts and
  assets, then review and authorize the five
  suitable promotion actions. Record real submission outcomes in the CSV.
  Publication, editorial decisions and review queues may extend beyond seven days.
- If a suitable analytics system is configured, verify the invitation funnel:
  landing visit, template selection, completed signup and invitation published.
  This document does not install a tracker or enable external tracking.
- Record any independent AI-search test separately: date, product/model, search
  setting, neutral prompt, actual mention/citation and destination URL. Supplying
  the URL in the prompt tests retrieval, not spontaneous recommendation.

### Seven-day review

Review index status, exclusion reasons, actual queries/pages with impressions,
clicks and completed invitation actions where measurable. For a new site, empty
or small reports remain insufficient evidence of a trend. Record what is known
and wait for meaningful observations rather than manufacturing a success metric.

### Twenty-eight-day review

Compare the first complete post-deployment 28-day period with the available
baseline using the same property, search type and filters. Separate branded
queries from nonbranded invitation searches, then review country/device and
page-level differences. Average position is an aggregate, not a universal rank
for every user. Use actual query impressions to refine titles and useful page
content, not to add keyword repetitions.

Assess promotion by accepted listings, relevant referral visits, invitation
publications and genuine mentions. UTM suggestions are in the promotion kit;
parameters alone do not provide analytics. If visits arrive but people cannot
finish an invitation, prioritize that workflow before producing more pages.

Google's [AI-search guidance](https://developers.google.com/search/docs/appearance/ai-features)
applies ordinary indexing and snippet eligibility to its AI features. The
optional text summary and structured data aid clarity; they are not evidence
of an external recommendation. The seven- and twenty-eight-day dates are review
points, not ranking, traffic or AI-placement deadlines.
