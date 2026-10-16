import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import type { InvitationRow } from '../../lib/supabase/types';

// An isolated HTTP contract double, never a replacement for testing real RLS,
// deployed Edge Functions, email delivery, or Supabase Storage.
type User = { id: string; email: string; password: string; confirmed: boolean };
type ResponseRow = Record<string, unknown> & { id: string; invitation_id: string };

export async function startSupabaseMock() {
  const users = new Map<string, User>();
  const tokens = new Map<string, User>();
  const invitations = new Map<string, InvitationRow>();
  const rsvps = new Map<string, ResponseRow>();
  const notes = new Map<string, ResponseRow>();
  const objects = new Map<string, { bytes: Buffer; contentType: string }>();
  const requests: { method: string; path: string; userId: string | null }[] = [];

  function userJson(user: User) {
    return { id: user.id, email: user.email, aud: 'authenticated', role: 'authenticated',
      is_anonymous: false, created_at: '2026-01-01T00:00:00Z',
      app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [],
      ...(user.confirmed ? { email_confirmed_at: '2026-01-01T00:00:00Z', confirmed_at: '2026-01-01T00:00:00Z' } : {}) };
  }

  function session(user: User) {
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: expiry, iat: expiry - 3600 })}.test-signature`;
    tokens.set(accessToken, user);
    return { access_token: accessToken, refresh_token: user.id, expires_in: 3600,
      expires_at: expiry, token_type: 'bearer', user: userJson(user) };
  }

  function send(res: ServerResponse, status: number, value?: unknown) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(value === undefined ? undefined : JSON.stringify(value));
  }

  function matches(row: Record<string, unknown>, search: URLSearchParams) {
    for (const [column, filter] of search) {
      if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(column)) continue;
      const separator = filter.indexOf('.');
      const operator = filter.slice(0, separator);
      const expected = filter.slice(separator + 1);
      const actual = String(row[column]);
      if (operator === 'eq' && actual !== expected) return false;
      if (operator === 'ilike' && actual.toLowerCase() !== expected.toLowerCase()) return false;
      if (operator === 'in' && !expected.slice(1, -1).split(',').includes(actual)) return false;
    }
    return true;
  }

  async function handle(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] ?? 'authorization, apikey, content-type, x-client-info, prefer, accept, accept-profile, content-profile, x-supabase-api-version, x-upsert, x-retry-count');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return send(res, 204);
    const url = new URL(req.url ?? '/', 'http://localhost');
    const bearer = req.headers.authorization?.replace(/^Bearer /i, '') ?? '';
    const user = tokens.get(bearer);
    if (!url.pathname.startsWith('/__test')) requests.push({ method: req.method ?? 'GET', path: url.pathname + url.search, userId: user?.id ?? null });
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks);
    if (url.pathname.startsWith('/storage/v1/object/public/')) {
      const object = objects.get(url.pathname.replace('/storage/v1/object/public/', ''));
      if (!object) return send(res, 404, { message: 'Object not found' });
      res.setHeader('Content-Type', object.contentType);
      return res.end(object.bytes);
    }
    if (url.pathname.startsWith('/storage/v1/object/') && req.method === 'POST') {
      const objectPath = url.pathname.replace('/storage/v1/object/', '');
      if (!user?.confirmed || objectPath.split('/')[1] !== user.id) return send(res, 403, { message: 'Account required' });
      const contentType = req.headers['content-type'] ?? 'application/octet-stream';
      if (contentType.includes('multipart/form-data')) {
        const form = await new Response(raw, { headers: { 'Content-Type': contentType } }).formData();
        const file = form.get('');
        if (!(file instanceof Blob)) return send(res, 400, { message: 'File missing' });
        objects.set(objectPath, { bytes: Buffer.from(await file.arrayBuffer()), contentType: file.type });
      } else objects.set(objectPath, { bytes: raw, contentType });
      return send(res, 200, { Key: objectPath, Id: randomUUID() });
    }
    const body = raw.length ? JSON.parse(raw.toString()) as Record<string, unknown> : {};

    if (url.pathname.startsWith('/storage/v1/object/') && req.method === 'DELETE') {
      const bucket = url.pathname.replace('/storage/v1/object/', '');
      for (const prefix of body.prefixes as string[] ?? []) {
        if (prefix.split('/')[0] === user?.id) objects.delete(`${bucket}/${prefix}`);
      }
      return send(res, 200, []);
    }

    if (url.pathname === '/__test/users' && req.method === 'POST') {
      const email = String(body.email);
      const created = users.get(email) ?? { id: randomUUID(), email, password: String(body.password), confirmed: body.confirmed !== false };
      users.set(email, created);
      return send(res, 200, userJson(created));
    }
    if (url.pathname === '/__test/invitations' && req.method === 'POST') {
      const row = body as unknown as InvitationRow;
      invitations.set(row.id, row);
      return send(res, 200, row);
    }
    if (url.pathname === '/__test/requests') return send(res, 200, requests);
    if (url.pathname === '/__test/health') return send(res, 200, { ok: true });

    if (url.pathname === '/auth/v1/token') {
      const email = String(body.email ?? '');
      const found = users.get(email) ?? [...users.values()].find(item => item.id === body.refresh_token);
      if (!found || (body.password !== undefined && found.password !== body.password)) return send(res, 400, { error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      if (!found.confirmed) return send(res, 400, { error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
      return send(res, 200, session(found));
    }
    if (url.pathname === '/auth/v1/signup') {
      const created: User = { id: randomUUID(), email: String(body.email ?? ''), password: String(body.password ?? ''), confirmed: false };
      users.set(created.email, created);
      return send(res, 200, { user: userJson(created), session: null });
    }
    if (url.pathname === '/auth/v1/user') return user
      ? send(res, 200, userJson(user))
      : send(res, 401, { code: 'bad_jwt', msg: 'Invalid JWT' });
    if (url.pathname === '/auth/v1/logout') {
      tokens.delete(bearer);
      return send(res, 204);
    }
    if (url.pathname === '/rest/v1/rpc/is_slug_available') return send(res, 200,
      ![...invitations.values()].some(row => row.slug.toLowerCase() === String(body.candidate).toLowerCase() && row.id !== body.self_id));
    if (url.pathname === '/rest/v1/rpc/rsvp_summary') {
      const invitation = invitations.get(String(body.invitation));
      const responses = invitation?.owner_id === user?.id ? [...rsvps.values()].filter(row => row.invitation_id === body.invitation) : [];
      return send(res, 200, ['attending', 'not-attending', 'maybe'].map(status => ({ status,
        replies: responses.filter(row => row.status === status).length,
        heads: responses.filter(row => row.status === status).reduce((total, row) => total + Number(row.guests), 0) })));
    }
    if (url.pathname === '/functions/v1/submit-response') {
      const invitation = invitations.get(String(body.invitationId));
      if (!invitation?.published) return send(res, 404, { error: 'Invitation not found' });
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      const row: ResponseRow = { ...(body.payload as Record<string, unknown>), id, invitation_id: invitation.id, created_at: createdAt, hidden: false };
      (body.kind === 'rsvp' ? rsvps : notes).set(id, row);
      return send(res, 200, { id, createdAt });
    }
    if (url.pathname === '/rest/v1/invitations') {
      if (req.method === 'POST') {
        if (!user?.confirmed) return send(res, 403, { code: '42501', message: 'Account required' });
        const incoming = body as unknown as InvitationRow;
        const previous = invitations.get(incoming.id);
        if (previous && previous.owner_id !== user.id) return send(res, 403, { code: '42501', message: 'Invitation belongs to another owner' });
        if ([...invitations.values()].some(row => row.id !== incoming.id && row.slug.toLowerCase() === incoming.slug.toLowerCase())) return send(res, 409, { code: '23505', message: 'Slug already exists' });
        invitations.set(incoming.id, { ...incoming, owner_id: user.id,
          created_at: previous?.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() });
        return send(res, 201);
      }
      const rows = [...invitations.values()].filter(row => (row.published || row.owner_id === user?.id) && matches(row, url.searchParams));
      if (req.method === 'DELETE') {
        rows.filter(row => row.owner_id === user?.id).forEach(row => invitations.delete(row.id));
        return send(res, 204);
      }
      rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      return send(res, 200, req.headers.accept?.includes('vnd.pgrst.object') ? rows[0] ?? null : rows);
    }
    if (['/rest/v1/rsvps', '/rest/v1/guest_messages'].includes(url.pathname)) {
      const table = url.pathname.endsWith('/rsvps') ? rsvps : notes;
      const rows = [...table.values()].filter(row => {
        const invitation = invitations.get(row.invitation_id);
        return matches(row, url.searchParams) && (invitation?.owner_id === user?.id || (table === notes && invitation?.published && !row.hidden));
      });
      if (req.method === 'DELETE' || req.method === 'PATCH') {
        rows.filter(row => invitations.get(row.invitation_id)?.owner_id === user?.id).forEach(row => req.method === 'DELETE' ? table.delete(row.id) : table.set(row.id, { ...row, ...body }));
        return send(res, 204);
      }
      return send(res, 200, rows);
    }
    return send(res, 404, { error: `Unhandled mock endpoint ${req.method} ${url.pathname}` });
  }

  const server = createServer((req, res) => { void handle(req, res).catch(error => send(res, 500, { error: String(error) })); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { origin, close: () => new Promise<void>((resolve, reject) => {
    server.closeAllConnections();
    server.close(error => error ? reject(error) : resolve());
  }) };
}
