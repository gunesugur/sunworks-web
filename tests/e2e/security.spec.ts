import { expect, test } from '@playwright/test';

const onlyOnce = () => test.skip(test.info().project.name !== 'chromium-1440', 'HTTP-level checks run once');

test('HTML responses carry security headers', async ({ request }) => {
  onlyOnce();
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['content-security-policy']).not.toContain("'unsafe-eval'");
  expect(h['content-security-policy']).toMatch(/script-src 'self' 'sha256-/);
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['strict-transport-security']).toContain('max-age=');
});

test('API rejects cross-origin, form-encoded and non-POST requests', async ({ request }) => {
  onlyOnce();
  const evil = await request.post('/api/contact', { headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, data: '{}' });
  expect(evil.status()).toBe(403);
  const form = await request.post('/api/contact', {
    headers: { Origin: 'http://127.0.0.1:8788', 'Content-Type': 'application/x-www-form-urlencoded' },
    data: 'name=x',
  });
  expect(form.status()).toBe(403);
  const get = await request.get('/api/contact');
  expect(get.status()).toBe(405);
});

test('API validates and never reflects payloads', async ({ request }) => {
  onlyOnce();
  const res = await request.post('/api/contact', {
    headers: { Origin: 'http://127.0.0.1:8788', 'Content-Type': 'application/json' },
    data: { lang: 'tr', name: '<svg onload=alert(1)>', email: "x' OR 1=1 --", topic: 'drop', message: 'short', consent: true, turnstileToken: 't' },
  });
  expect(res.status()).toBe(400);
  const body = await res.text();
  expect(body).not.toContain('<svg');
  expect(body).not.toContain('OR 1=1');
  expect(res.headers()['cache-control']).toBe('no-store');
});
