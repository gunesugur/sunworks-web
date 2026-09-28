// Adds security headers (incl. a hash-based CSP for the few inline scripts) to dist/client/_headers.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/* eslint-disable security/detect-non-literal-fs-filename -- build-time script; paths are derived from the fixed dist/client directory only */

const ROOT = 'dist/client';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return p.endsWith('.html') ? [p] : [];
  });
}

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;
const hashes = new Set();
for (const file of htmlFiles(ROOT)) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const body = match[1] ?? '';
    if (body.trim()) hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} https://challenges.cloudflare.com`.replace(/\s+/g, ' '),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://challenges.cloudflare.com https://www.openstreetmap.org',
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join('; ');

const block = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
`;

const target = join(ROOT, '_headers');
const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
if (!existing.includes('Content-Security-Policy')) writeFileSync(target, `${block}\n${existing}`);
console.log(`[headers] CSP with ${hashes.size} inline script hash(es) written to ${target}`);
