export type ErrorCode = 'validation' | 'rate' | 'captcha' | 'unavailable' | 'generic' | 'forbidden' | 'method';

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

export function json(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } });
}

export const ok = () => json(200, { ok: true });
export const fail = (status: number, error: ErrorCode, fields?: string[]) =>
  json(status, fields?.length ? { ok: false, error, fields } : { ok: false, error });

export const MAX_BODY_BYTES = 16 * 1024;

/**
 * CSRF / origin protection: only same-origin JSON POSTs are accepted.
 * A cross-site form cannot send application/json without a CORS preflight, which we never allow.
 */
export function checkRequest(request: Request, allowedOrigins: string[]): ErrorCode | null {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const allowed = new Set([url.origin, ...allowedOrigins]);
  if (!origin || !allowed.has(origin)) return 'forbidden';
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin') return 'forbidden';
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) return 'forbidden';
  const length = Number(request.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY_BYTES) return 'validation';
  return null;
}

export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error('too large');
  return JSON.parse(text) as unknown;
}
