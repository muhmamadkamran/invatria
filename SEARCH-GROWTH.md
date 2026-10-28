# Worldwide English search plan

Audience: worldwide English searches, as requested by the owner.

Latest implementation and measurement state:
[campaign status](seo/campaign-status.md), [promotion drafts](seo/promotion-kit.md)
and [opportunity spreadsheet](seo/promotion-opportunities.csv). Commit `403ee77`
is deployed and adds `/tools/whatsapp-invitation-message`, bringing the verified
live sitemap to 16 public URLs. The 15-page audit below predates that deployment.

Current production URL: `https://invitra-ai.netlify.app`. The Netlify hostname
was renamed; migrate canonical URLs, sitemap submission, Search Console property
and old-site redirects using [migration/README.md](migration/README.md). Earlier
search observations about `invatria.netlify.app` are historical.

Brand discovery comes first: monitor `Invitra`, `Invatria`, `Invitra invitations`
and `Invatria invitations` in Search Console before using generic-keyword rank
as the only progress measure. The primary brand remains Invitra; the owner
approved Invatria as an alternate spelling. Homepage identity schema and visible
copy now associate both spellings. Confirm actual indexing in the Google Index
tab and confirm the latest source is deployed before interpreting rank changes.

The owner also explicitly requested common "invitation card" searches. The
homepage title, H1, description and social metadata now use that wording
naturally, while still describing an online digital invitation service. The
template catalog targets "invitation card templates". Current result checks
show both card-making tools and physical printing services for the broad phrase;
Invitra does not claim to sell printed cards. These copy changes improve topic
clarity and do not establish that rankings have changed.

The expanded bank contains **240 unique keyword candidates in 16 clusters**:
[read the grouped list](seo/keyword-research.md) or
[open the spreadsheet-ready CSV](seo/keyword-research.csv). Each row includes
intent, relevance priority, a mapped page and its coverage status. Clusters with
only catalog coverage are marked as future editorial opportunities, not
implemented dedicated landing pages. None of the 240 phrases has a verified
search-volume or difficulty estimate.

## Keyword and page map

These are relevant query targets inferred from current search results and the
product's actual features. They are not search-volume, difficulty or traffic
estimates. No Google Ads Keyword Planner, paid keyword tool or Search Console
query export was available for volume validation.

| Main query target | Related queries | Destination |
| --- | --- | --- |
| free online invitation card maker with RSVP | invitation card, invitation card maker, free digital invitation maker, online invitations with RSVP | `/` |
| free digital wedding invitations with RSVP | wedding invitation wording, share wedding invitation link | `/invitations/wedding` |
| free online birthday invitation maker | birthday invitation wording, birthday invitations with RSVP, birthday invitation link | `/invitations/birthday` |
| free digital baby shower invitations | baby shower invitation wording, baby shower invitations with RSVP | `/invitations/baby-shower` |
| free online nikah invitation maker | nikah invitation wording in English, digital nikah invitation | `/invitations/nikah` |
| invitation templates and wording by occasion | invitation checklist, invitation wording examples | `/invitations` |
| WhatsApp invitation message generator | wedding invitation message for WhatsApp, birthday invitation message, nikah invitation wording for WhatsApp | `/tools/whatsapp-invitation-message` |

Research found dedicated wedding, birthday, baby shower and nikah pages in the
current results. This supports an occasion-specific intent hypothesis, not a
claim that any phrase is easy to rank for. Broad invitation-maker searches are
already served by multiple competing products. Invitra's focused pages need to
answer their own audience's questions rather than repeat a generic landing page.

Examples of primary sites observed in the research:

- https://invitecount.com/online-wedding-invitations
- https://www.savedate.me/birthday-invitations
- https://www.invitedrop.com/baby-shower
- https://ayozan.com/c/nikah-invitation-cards

Competitor copy was not reused. Each new Invitra page has its own checklist,
original sample wording, planning guidance, FAQs and relevant design examples.
The homepage, occasion tiles, footer, hub and related-page links lead visitors
into these pages. Their canonical URLs are included in the generated sitemap.

## Visitor usefulness and conversion

- Let visitors see actual designs before asking them to sign in.
- State that a free account is required to save and publish, while guests can
  reply without an account. Avoid the misleading keyword promise "no signup".
- Provide copyable wording that works as a starting point for the editor.
- Preserve the selected occasion and template in each creation link.
- Link to related guides and keep FAQ answers readable without JavaScript.
- Maintain the hydration and local-font fixes while adding content. Search
  landing pages should have visible server-rendered content without waiting for
  entrance animations.

## Deployment and measurement

Deploy the new pages, then inspect `/invitations` and the four occasion URLs in
Search Console. The submitted sitemap updates automatically after deployment;
the current verified deployment lists 16 public pages, including the WhatsApp
tool. Request indexing of the new URLs if appropriate and available.
Keep private invitations and account pages excluded from search.

In Search Console, compare consistent date ranges once sufficient data exists:

1. Filter Performance by each new page and examine its actual query impressions,
   clicks, CTR and average position. Use the Queries tab to refine this keyword
   map, including unanticipated phrases visitors actually use.
2. If impressions grow but clicks remain weak, check whether the title and
   description match those queries before rewriting the page.
3. If clicks arrive but visitors do not create invitations, review the preview,
   account sign-in and editor path. Clicks and rankings alone do not measure
   successful invitation publishing.
4. Validate site loading and indexing issues separately. Do not infer that a
   sitemap submission or indexability test establishes ranking improvement.

Search Console does not report on-site engagement or completed publications.
No analytics account was supplied and no new third-party visitor tracking has
been enabled. Measure that funnel with an appropriately configured analytics
system when the owner chooses one.

## Promotion

Publish examples of the original designs and short screen recordings showing
how to create and share an invitation. Link to the relevant occasion page.
Approach event planners or wedding vendors whose audiences could use the tool;
offer a useful demonstration rather than asking for unrelated keyword links.
Only post in communities that permit self-promotion and disclose the connection
to Invitra. No outreach, paid advertising or public posts have been sent.

There is no guaranteed first-page position, traffic amount or ranking deadline.
Editorial links from Forbes, BBC or TechCrunch cannot be created by changing
the website. Do not buy spam links, fabricate reviews or publish repetitive
pages for every keyword variation.

## Validation

The production build, TypeScript, focused ESLint and 20 distinct production
tests passed. Coverage includes indexable HTML, canonicals, sitemap entries,
FAQ/breadcrumb JSON-LD, unknown-occasion 404, clipboard copying, creation links,
the WhatsApp tool, social metadata and hydration under both motion settings,
including Netlify's head transformation. Commit `403ee77` is live; the deployed
audit checked 16 public pages with zero errors or warnings. Search impressions,
clicks, index status and rankings still require current Search Console data.
