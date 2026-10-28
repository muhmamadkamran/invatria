# AI search discovery for Invitra

Production origin: https://invitra-ai.netlify.app
Primary name: Invitra. Alternate name: Invatria.

## Implemented

- Explicit OAI-SearchBot, Claude-SearchBot and PerplexityBot rules allow public
  content and repeat the existing exclusions for invitations, creation, account
  pages and authentication. The wildcard policy already allowed public search
  crawlers; this makes the policy explicit rather than removing an observed block.
- Googlebot and Bing continue using the public wildcard policy. No special
  training-bot preferences have been introduced by this change.
- The About page now gives a concise product description, pricing and account
  requirements, template names, supported languages, sharing, exports and RSVP
  capabilities in visible server-rendered HTML.
- A shared source generates those facts, the WebApplication schema and the
  optional `/llms.txt` summary. WebSite, Organization and WebApplication entities
  are connected through stable identifiers on the canonical origin.
- The existing occasion guides provide original wording, checklists and actual
  design examples. The footer links to the product facts, and the text summary
  links to public canonical source pages rather than personal invitations.

`/llms.txt` is an optional convenience summary. It is not a documented requirement
for Google's AI features and is not evidence that any assistant has read,
indexed or recommended the site. There are no instructions to override an
assistant's behavior, fabricated endorsements, rankings or customer reviews.

## Publish and verify

1. Commit and push these changes, then deploy the updated source on Netlify.
2. Check `/robots.txt`, `/about#product-facts` and `/llms.txt` on the live origin.
3. If hosting security blocks real crawler requests, use the operator's official
   verification/IP guidance. Sending an arbitrary user-agent string from a test
   browser is not proof of access from that operator's infrastructure. Robots.txt
   is also not access control for private user data.
4. Continue checking actual Google indexing. Google requires a page to be indexed
   and eligible for snippets before it can be a supporting link in AI Overviews
   or AI Mode. Sitemap discovery alone does not satisfy this requirement.
5. Test discovery separately from direct retrieval: asking an assistant to read
   a supplied Invitra URL checks readability, not spontaneous recommendations.
   For relevant general prompts, record whether search is enabled, the date,
   query, actual citation URL and any referral traffic. Avoid treating answers
   from this development conversation as independent recommendation evidence.

The site owner cannot make every assistant recommend this website. Crawling,
indexing, retrieval, relevance and the assistant's selection remain separate
steps. No paid placements, training uploads or AI-platform submissions were made.

## Official references checked

Validation: production build, TypeScript and ESLint passed. Twenty distinct
production tests passed across the discovery, rendering and invitation flows.
Coverage includes crawler rules and invitation exclusions, reachable summary
links, product facts without JavaScript, consistent schema, site identity,
social previews and the message tool. Hydration checks cover both motion
preferences and the exact Netlify head insertion that reproduced live error
#418. The font fallback was moved to the body to avoid that mismatch. These
are implementation checks, not evidence of external indexing or independent
AI recommendations. Commit `403ee77` was deployed and verified on October 28:
16 public URLs passed the HTTP audit, the optional summary returned 200, and
homepage/catalog browser checks reported no JavaScript errors. See the
[deployed audit](seo/baselines/2026-10-28-deployed-audit.json).

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots):
  OAI-SearchBot is for ChatGPT search; GPTBot's training role is separate.
- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features):
  indexing and regular SEO requirements apply; no special AI text file or schema
  is required.
- [Anthropic crawler guidance](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler):
  Claude-SearchBot is distinct from model-training crawling.
- [Perplexity crawler guidance](https://docs.perplexity.ai/docs/resources/perplexity-crawlers):
  PerplexityBot discovery and hosting/WAF configuration.
