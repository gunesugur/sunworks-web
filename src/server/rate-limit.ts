export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

const DAY = 86_400;

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** IPv6 clients usually control a whole /64, so they are bucketed by their /64 prefix. */
export function ipBucket(ip: string): string {
  if (!ip.includes(':')) return ip;
  const [head = '', tail = ''] = ip.split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];
  const missing = Math.max(0, 8 - headParts.length - tailParts.length);
  const full = ip.includes('::') ? [...headParts, ...Array<string>(missing).fill('0'), ...tailParts] : headParts;
  return `${full
    .slice(0, 4)
    .map((p) => p.toLowerCase().replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}

export async function rateKey(salt: string, scope: string, ip: string): Promise<string> {
  return sha256(`${salt}:${scope}:${ipBucket(ip)}`);
}

/** Fixed-window counter in D1. Returns true when the request is allowed. */
export async function hit(db: D1Database, key: string, opts: RateLimitOptions, now = Date.now()): Promise<boolean> {
  const nowSec = Math.floor(now / 1000);
  const windowStart = nowSec - (nowSec % opts.windowSeconds);
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
         window_start = excluded.window_start
       RETURNING count`,
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= opts.limit;
}

/** Deletes rate-limit rows older than 24 hours (as stated in the privacy policy). */
export async function purge(db: D1Database, now = Date.now()): Promise<void> {
  await db.prepare('DELETE FROM rate_limits WHERE window_start < ?1').bind(Math.floor(now / 1000) - DAY).run();
}
