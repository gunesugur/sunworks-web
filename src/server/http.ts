export type ErrorCode = 'validation' | 'rate' | 'captcha' | 'unavailable' | 'generic' | 'forbidden' | 'method' | 'length';

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

export interface Rejection {
  status: number;
  error: ErrorCode;
}

/**
 * CSRF / origin protection: only same-origin (or explicitly allowed same-site) JSON POSTs are accepted.
 * A cross-site HTML form cannot send application/json without a CORS preflight, which is never allowed.
 * A Content-Length is required so oversize bodies are refused before anything is read.
 */
export function checkRequest(request: Request, allowedOrigins: string[]): Rejection | null {
  const selfOrigin = new URL(request.url).origin;
  const origin = request.headers.get('Origin');
  const isSelf = origin === selfOrigin;
  if (!origin || (!isSelf && !allowedOrigins.includes(origin))) return { status: 403, error: 'forbidden' };
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  const okSites = isSelf ? ['same-origin'] : ['same-origin', 'same-site'];
  if (fetchSite && !okSites.includes(fetchSite)) return { status: 403, error: 'forbidden' };
  const type = request.headers.get('Content-Type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) return { status: 403, error: 'forbidden' };
  const lengthHeader = request.headers.get('Content-Length');
  if (lengthHeader === null) return { status: 411, error: 'length' };
  const length = Number(lengthHeader);
  if (!Number.isFinite(length) || length < 0 || length > MAX_BODY_BYTES) return { status: 413, error: 'validation' };
  return null;
}

/** Reads at most MAX_BODY_BYTES bytes, even if Content-Length lied. */
export async function readJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}
