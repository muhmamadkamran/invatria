import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key || url.includes('your-project') || key.includes('your-public')) {
  const missing = [!url || url.includes('your-project') ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !key || key.includes('your-public') ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null].filter(Boolean);
  console.error(`BLOCKED: Set ${missing.join(' and ')} in .env.local to check the real Supabase project.`);
  process.exitCode = 1;
} else {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Origin: origin };
  const checks = [
    { name: 'Auth email provider', path: '/auth/v1/settings', validate: (data) => data.external?.email === true },
    { name: 'Invitations table', path: '/rest/v1/invitations?select=id&limit=0' },
    { name: 'RSVP table', path: '/rest/v1/rsvps?select=id&limit=0' },
    { name: 'Guest-book table', path: '/rest/v1/guest_messages?select=id&limit=0' },
    { name: 'Slug availability function', path: '/rest/v1/rpc/is_slug_available', body: { candidate: `healthcheck-${Date.now()}`, self_id: null }, validate: (data) => typeof data === 'boolean' },
    // Supabase default grants may let anon call this boolean helper, but it
    // must return false (or refuse access), never recognize anon as registered.
    { name: 'Registered-account policy helper deployed', path: '/rest/v1/rpc/has_registered_account', body: {}, statuses: [200, 401, 403], validate: (data, response) => response.status === 200 ? data === false : data.code === '42501' },
    // Unknown kind is rejected before database access or any write by the handler.
    { name: 'Public guest-response function and CORS', path: '/functions/v1/submit-response', body: { kind: 'healthcheck' }, status: 400, validate: (data, response) => data.error === 'Unknown submission type' && [origin, '*'].includes(response.headers.get('access-control-allow-origin')) },
  ];
  const results = await Promise.all(checks.map(async (check) => {
    try {
      const response = await fetch(`${url.replace(/\/$/, '')}${check.path}`, {
        method: check.body ? 'POST' : 'GET', headers,
        ...(check.body ? { body: JSON.stringify(check.body) } : {}),
        signal: AbortSignal.timeout(15_000),
      });
      const data = await response.json();
      const passed = (check.statuses ?? [check.status ?? 200]).includes(response.status) && (!check.validate || check.validate(data, response));
      console.log(`${passed ? 'PASS' : 'FAIL'}: ${check.name} (HTTP ${response.status})`);
      return passed;
    } catch {
      console.error(`FAIL: ${check.name} (request failed)`);
      return false;
    }
  }));
  console.log('These checks do not verify login, uploads, row policies or an end-to-end publish. Run the deployed smoke tests for those. No app records were written.');
  if (results.some(passed => !passed)) process.exitCode = 1;
}
