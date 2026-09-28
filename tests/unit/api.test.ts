/**
 * API security tests (basic pen-test checklist): origin/CSRF, content type, body size,
 * validation, honeypot, captcha, rate limit, injection and XSS payload handling.
 */
import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';
import type { DatabaseSync } from 'node:sqlite';
import { contactForm, handleForm, newsletterForm, type FormEnv } from '../../src/server/forms';
import { clean } from '../../src/server/validation';
import { createTestDb } from './d1-sqlite';

const ORIGIN = 'https://sunworks.studio';
let raw: DatabaseSync;
let env: FormEnv;
let turnstileOk = true;
const fetcher = (async () => new Response(JSON.stringify({ success: turnstileOk }), { status: 200 })) as unknown as typeof fetch;

beforeEach(() => {
  const t = createTestDb();
  raw = t.raw;
  env = { DB: t.db, TURNSTILE_SECRET_KEY: 'secret', RATE_LIMIT_SALT: 'salt', FORMS_ENABLED: 'true' };
  turnstileOk = true;
});

const valid = {
  lang: 'tr',
  name: 'Ada Lovelace',
  email: 'Ada@Example.com',
  topic: 'wordpress',
  message: 'Merhaba, sitem için yardım lazım.',
  consent: true,
  website: '',
  turnstileToken: 'token',
};

function req(body: unknown, init: { origin?: string | null; type?: string; ip?: string; method?: string; site?: string; raw?: string } = {}) {
  const headers = new Headers();
  if (init.origin !== null) headers.set('Origin', init.origin ?? ORIGIN);
  headers.set('Content-Type', init.type ?? 'application/json');
  headers.set('CF-Connecting-IP', init.ip ?? '203.0.113.7');
  if (init.site) headers.set('Sec-Fetch-Site', init.site);
  return new Request(`${ORIGIN}/api/contact`, { method: init.method ?? 'POST', headers, body: init.raw ?? JSON.stringify(body) });
}

const send = (r: Request, form = contactForm) => handleForm(form as typeof contactForm, r, env, { fetcher });

test('valid contact submission is stored and returns ok', async () => {
  const res = await send(req(valid));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  const row = raw.prepare('SELECT name, email, topic FROM contact_messages').get() as Record<string, string>;
  assert.deepEqual({ ...row }, { name: 'Ada Lovelace', email: 'ada@example.com', topic: 'wordpress' });
});

test('rejects cross-origin, missing origin and cross-site fetches (CSRF)', async () => {
  assert.equal((await send(req(valid, { origin: 'https://evil.example' }))).status, 403);
  assert.equal((await send(req(valid, { origin: null }))).status, 403);
  assert.equal((await send(req(valid, { site: 'cross-site' }))).status, 403);
});

test('rejects form-encoded bodies (no simple cross-site form posts)', async () => {
  const res = await send(req(null, { type: 'application/x-www-form-urlencoded', raw: 'name=x' }));
  assert.equal(res.status, 403);
});

test('rejects oversize and malformed bodies', async () => {
  const big = await send(req({ ...valid, message: 'a'.repeat(20_000) }));
  assert.equal(big.status, 400);
  const broken = await send(req(null, { raw: '{"lang":' }));
  assert.equal(broken.status, 400);
});

test('reports invalid fields without echoing input', async () => {
  const res = await send(req({ ...valid, name: '<script>', email: 'nope', consent: false }));
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error: string; fields: string[] };
  assert.equal(body.error, 'validation');
  assert.deepEqual(body.fields.sort(), ['consent', 'email']);
  assert.ok(!JSON.stringify(body).includes('script'));
});

test('honeypot filled → rejected (no fake success)', async () => {
  const res = await send(req({ ...valid, website: 'http://spam.example' }));
  assert.equal(res.status, 400);
  assert.equal(raw.prepare('SELECT count(*) AS n FROM contact_messages').get()?.['n'], 0);
});

test('failed Turnstile → 403 captcha and nothing stored', async () => {
  turnstileOk = false;
  const res = await send(req(valid));
  assert.equal(res.status, 403);
  assert.equal(((await res.json()) as { error: string }).error, 'captcha');
  assert.equal(raw.prepare('SELECT count(*) AS n FROM contact_messages').get()?.['n'], 0);
});

test('missing configuration → 503 unavailable (never a fake success)', async () => {
  delete env.TURNSTILE_SECRET_KEY;
  const res = await send(req(valid));
  assert.equal(res.status, 503);
});

test('rate limit: 6th request in the window is refused, other IPs unaffected', async () => {
  for (let i = 0; i < 5; i += 1) assert.equal((await send(req(valid))).status, 200);
  assert.equal((await send(req(valid))).status, 429);
  assert.equal((await send(req(valid, { ip: '198.51.100.1' }))).status, 200);
  const keys = raw.prepare('SELECT key FROM rate_limits').all() as { key: string }[];
  assert.ok(keys.every((k) => /^[a-f0-9]{64}$/.test(k.key)), 'only hashed keys are stored');
  assert.ok(!JSON.stringify(keys).includes('203.0.113.7'));
});

test('SQL injection payloads are stored verbatim via bound parameters', async () => {
  const payload = "x'); DROP TABLE contact_messages; --";
  const res = await send(req({ ...valid, message: `${payload} ${payload}` }));
  assert.equal(res.status, 200);
  const row = raw.prepare('SELECT message FROM contact_messages').get() as { message: string };
  assert.equal(row.message, `${payload} ${payload}`);
});

test('XSS payloads are never reflected in responses', async () => {
  const xss = '<img src=x onerror=alert(1)>';
  const res = await send(req({ ...valid, name: xss }));
  const text = await res.text();
  assert.ok(!text.includes('<img'));
});

test('control characters are stripped', () => {
  assert.equal(clean('a\u0000b\u0007c'), 'abc');
  assert.equal(clean('line1\nline2\u001b', true), 'line1\nline2');
});

test('newsletter is idempotent and does not reveal existing addresses', async () => {
  const body = { lang: 'en', email: 'x@y.co', turnstileToken: 't' };
  const a = await send(req(body), newsletterForm as unknown as typeof contactForm);
  const b = await send(req(body, { ip: '198.51.100.2' }), newsletterForm as unknown as typeof contactForm);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(raw.prepare('SELECT count(*) AS n FROM newsletter_subscribers').get()?.['n'], 1);
});

test('JSON responses carry no-store and nosniff headers', async () => {
  const res = await send(req(valid));
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
});
