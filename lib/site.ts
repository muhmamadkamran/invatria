/**
 * The canonical origin for absolute URLs — Open Graph tags, the sitemap and
 * share links.
 *
 * Netlify injects `URL` for the production domain and `DEPLOY_PRIME_URL` for
 * branch and deploy previews, so previews advertise themselves rather than
 * pointing at production. An explicit NEXT_PUBLIC_SITE_URL always wins.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
