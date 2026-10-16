import { randomUUID } from 'node:crypto';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { blankInvitation } from '../../lib/defaults';
import { mockOrigin } from '../support/fixtures';
import type { InvitationRow } from '../../lib/supabase/types';

async function seed(request: APIRequestContext, published: boolean) {
  const inv = { ...blankInvitation(), slug: `production-${randomUUID()}`, hostPrimary: `SSR Test ${randomUUID()}`, published };
  const row: InvitationRow = { id: inv.id, slug: inv.slug, owner_id: randomUUID(), published,
    template_id: inv.templateId, category: inv.category, language: inv.language, data: inv,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  expect((await request.post(`${mockOrigin()}/__test/invitations`, { data: row })).ok()).toBeTruthy();
  return inv;
}

test('a slug created after build renders public HTML and link metadata on its first production request', async ({ request }) => {
  // No params existed at build time; this must exercise the ISR fallback.
  const inv = await seed(request, true);
  const visitors: Record<string, string>[] = [{}, { Cookie: 'visitor=another-browser' }];
  for (const headers of visitors) {
    const response = await request.get(`/i/${inv.slug}`, { headers });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(new RegExp(`<title>[^<]*${inv.hostPrimary}`));
    expect(html).toContain(`<meta property="og:title" content="${inv.hostPrimary}"`);
    const visibleHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    expect(visibleHtml).toContain(inv.hostPrimary);
    expect(visibleHtml).toContain('Open Invitation');
    expect(html).not.toContain('DYNAMIC_SERVER_USAGE');
  }
});

test('unpublished and unknown slugs do not expose draft data or fail production rendering', async ({ request }) => {
  const draft = await seed(request, false);
  for (const slug of [draft.slug, `missing-${randomUUID()}`]) {
    const response = await request.get(`/i/${slug}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toContain(draft.hostPrimary);
    expect(html).not.toContain('DYNAMIC_SERVER_USAGE');
  }
});
