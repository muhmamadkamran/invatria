import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const value = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const origin = new URL(value("--origin", "https://invitra-ai.netlify.app")).origin;
// Audit a local production build while checking its real public canonicals.
const canonicalOrigin = new URL(value("--canonical-origin", origin)).origin;
const output = value("--output", ".tmp/seo-audit.json");
const report = {
  origin, canonicalOrigin, checkedAtUtc: new Date().toISOString(),
  limitations: ["Public HTTP/rendering audit, not a Google indexing or rank report.", "User-agent checks do not verify requests from a search provider's infrastructure."],
  endpoints: {}, pages: [], findings: [],
};
const decode = text => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), decode(match[2])]));
const meta = (html, key) => [...html.matchAll(/<meta\s[^>]*>/gi)].map(match => attributes(match[0])).find(item => item.name === key || item.property === key)?.content;
const canonical = html => [...html.matchAll(/<link\s[^>]*>/gi)].map(match => attributes(match[0])).find(item => item.rel === "canonical")?.href;
const finding = (severity, url, issue) => report.findings.push({ severity, url, issue });
async function get(url, headers) {
  const start = performance.now();
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    return { status: response.status, finalUrl: response.url, responseMs: Math.round(performance.now() - start), contentType: response.headers.get("content-type"), robotsHeader: response.headers.get("x-robots-tag"), body: await response.text() };
  } catch (error) { return { status: null, responseMs: Math.round(performance.now() - start), error: error.message, body: "" }; }
}
const [robots, sitemap, summary] = await Promise.all(["/robots.txt", "/sitemap.xml", "/llms.txt"].map(route => get(origin + route)));
report.endpoints.robots = { ...robots, body: robots.body };
report.endpoints.sitemap = { ...sitemap, body: undefined };
report.endpoints.optionalSummary = { status: summary.status, contentType: summary.contentType };
if (robots.status !== 200) finding("error", origin + "/robots.txt", "Robots file did not return 200.");
if (sitemap.status !== 200) finding("error", origin + "/sitemap.xml", "Sitemap did not return 200.");
const urls = [...new Set([...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1])))];
if (!urls.length) finding("error", origin + "/sitemap.xml", "No sitemap URLs found.");
const publicUrls = urls.filter(url => {
  try { if (new URL(url).origin === canonicalOrigin) return true; } catch { /* Invalid URL reported below. */ }
  finding("error", url, "Sitemap URL is invalid or points to another origin.");
  return false;
});
for (let index = 0; index < publicUrls.length; index += 4) {
  const entries = await Promise.all(publicUrls.slice(index, index + 4).map(async url => {
    const publicUrl = new URL(url);
    const response = await get(origin + publicUrl.pathname + publicUrl.search);
    const html = response.body;
    const links = [...html.matchAll(/<a\s[^>]*>/gi)].map(match => attributes(match[0]).href).filter(Boolean).flatMap(href => {
      try { const link = new URL(href, url); return link.origin === canonicalOrigin ? [link.pathname] : []; } catch { return []; }
    });
    const schemas = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => {
      try { return [JSON.parse(match[1])].flat(); } catch { finding("error", url, "Invalid JSON-LD."); return []; }
    });
    const page = {
      url, status: response.status, responseMs: response.responseMs,
      title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? ""),
      description: meta(html, "description"), canonical: canonical(html),
      robots: meta(html, "robots"), robotsHeader: response.robotsHeader,
      h1Count: [...html.matchAll(/<h1(?:\s|>)/gi)].length,
      ogImage: meta(html, "og:image"), ogUrl: meta(html, "og:url"),
      schemaTypes: schemas.map(item => item["@type"]), links,
    };
    if (page.status !== 200) finding("error", url, `Public page returned ${page.status ?? "a network error"}.`);
    if (/noindex/i.test(`${page.robots ?? ""} ${page.robotsHeader ?? ""}`)) finding("error", url, "Public page prevents indexing.");
    if (page.h1Count !== 1) finding("error", url, `Expected one descriptive H1, found ${page.h1Count}.`);
    if (!page.title || !page.description) finding("warning", url, "Missing title or description.");
    let canonicalMatches = false;
    try { canonicalMatches = Boolean(page.canonical) && new URL(page.canonical, url).href.replace(/\/$/, "") === url.replace(/\/$/, ""); } catch { /* Report malformed canonical values as findings. */ }
    if (!canonicalMatches) finding("error", url, "Canonical does not match the sitemap page.");
    if (!page.ogImage) finding("warning", url, "No social-preview image is declared.");
    if (page.ogUrl && page.ogUrl.replace(/\/$/, "") !== url.replace(/\/$/, "")) finding("warning", url, "Open Graph URL differs from this page.");
    return page;
  }));
  report.pages.push(...entries);
}
for (const page of report.pages) {
  const pathname = new URL(page.url).pathname;
  if (pathname !== "/" && !report.pages.some(other => other.url !== page.url && other.links.includes(pathname))) finding("warning", page.url, "No incoming link found among the audited pages.");
}
for (const key of ["title", "description"]) {
  const seen = new Map();
  for (const page of report.pages) {
    const value = page[key];
    if (value && seen.has(value)) finding("warning", page.url, `Duplicate ${key} also used on ${seen.get(value)}.`);
    if (value) seen.set(value, page.url);
  }
}
if (args.includes("--browser")) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ headless: true });
  report.renderChecks = [];
  for (const pathname of ["/", "/templates"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__seoAudit = { lcpMs: 0, cls: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__seoAudit.lcpMs = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__seoAudit.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
    });
    try {
      await page.goto(origin + pathname, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(1500);
      const metrics = await page.evaluate(() => ({
        ...window.__seoAudit,
        ttfbMs: performance.getEntriesByType("navigation")[0].responseStart,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        missingAlt: [...document.images].filter(image => !image.hasAttribute("alt")).length,
      }));
      report.renderChecks.push({ pathname, viewport: "390x844", method: "Single unthrottled lab observation with 1.5s post-load window; not field Core Web Vitals.", ...metrics, errors });
    } catch (error) { report.renderChecks.push({ pathname, error: error.message }); }
    await context.close();
  }
  await browser.close();
}
report.summary = { publicPages: report.pages.length, errors: report.findings.filter(item => item.severity === "error").length, warnings: report.findings.filter(item => item.severity === "warning").length };
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ output, ...report.summary, renderChecks: report.renderChecks ?? [] }));
process.exitCode = report.summary.errors ? 1 : 0;
