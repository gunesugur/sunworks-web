const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cloudflare's documented test secrets (always pass / always fail / token already spent). */
export const isTestSecret = (secret: string) => /^[123]x0{31}AA$/.test(secret);

export interface VerifyOptions {
  secret: string;
  ip: string | null;
  /** Expected hostname of the page that rendered the widget (ignored for test secrets). */
  hostname: string;
  fetcher?: typeof fetch;
}

export async function verifyTurnstile(token: string, opts: VerifyOptions): Promise<boolean> {
  const body = new FormData();
  body.append('secret', opts.secret);
  body.append('response', token);
  if (opts.ip) body.append('remoteip', opts.ip);
  body.append('idempotency_key', crypto.randomUUID());
  try {
    const res = await (opts.fetcher ?? fetch)(VERIFY_URL, { method: 'POST', body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    return isTestSecret(opts.secret) || !data.hostname || data.hostname === opts.hostname;
  } catch {
    return false;
  }
}
