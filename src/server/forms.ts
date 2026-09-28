import type { z } from 'zod';
import { checkRequest, fail, ok, readJson } from './http';
import { hit, purge, rateKey, type RateLimitOptions } from './rate-limit';
import { verifyTurnstile } from './turnstile';
import { contactSchema, failedFields, newsletterSchema, type ContactInput, type NewsletterInput } from './validation';

export interface FormEnv {
  DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_SALT?: string;
  FORMS_ENABLED?: string;
  ALLOWED_ORIGINS?: string;
  /** Optional override (e.g. a higher value for e2e runs). */
  RATE_LIMIT_MAX?: string;
}

interface FormDef<T> {
  scope: 'contact' | 'newsletter';
  schema: z.ZodType<T>;
  limit: RateLimitOptions;
  store: (db: D1Database, data: T) => Promise<void>;
}

export const contactForm: FormDef<ContactInput> = {
  scope: 'contact',
  schema: contactSchema,
  limit: { limit: 5, windowSeconds: 600 },
  store: async (db, d) => {
    await db
      .prepare('INSERT INTO contact_messages (lang, name, email, topic, message) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(d.lang, d.name, d.email, d.topic, d.message)
      .run();
  },
};

export const newsletterForm: FormDef<NewsletterInput> = {
  scope: 'newsletter',
  schema: newsletterSchema,
  limit: { limit: 5, windowSeconds: 600 },
  store: async (db, d) => {
    // Idempotent: an existing address is not an error, and we don't reveal whether it existed.
    await db
      .prepare('INSERT INTO newsletter_subscribers (email, lang) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING')
      .bind(d.email, d.lang)
      .run();
  },
};

export interface HandleOptions {
  fetcher?: typeof fetch;
  waitUntil?: (p: Promise<unknown>) => void;
}

export async function handleForm<T extends { turnstileToken: string }>(
  def: FormDef<T>,
  request: Request,
  env: FormEnv,
  opts: HandleOptions = {},
): Promise<Response> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  const rejected = checkRequest(request, allowed);
  if (rejected) return fail(rejected === 'forbidden' ? 403 : 413, rejected);

  if (env.FORMS_ENABLED !== 'true' || !env.DB || !env.TURNSTILE_SECRET_KEY || !env.RATE_LIMIT_SALT) {
    return fail(503, 'unavailable');
  }
  const db = env.DB;

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return fail(400, 'validation');
  }

  const ip = request.headers.get('CF-Connecting-IP');
  try {
    const key = await rateKey(env.RATE_LIMIT_SALT, def.scope, ip ?? 'unknown');
    const max = Number(env.RATE_LIMIT_MAX);
    const limit = Number.isInteger(max) && max > 0 ? { ...def.limit, limit: max } : def.limit;
    if (!(await hit(db, key, limit))) return fail(429, 'rate');
  } catch {
    return fail(503, 'unavailable');
  }

  const parsed = def.schema.safeParse(body);
  if (!parsed.success) return fail(400, 'validation', failedFields(parsed.error));

  const human = await verifyTurnstile(parsed.data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip, opts.fetcher);
  if (!human) return fail(403, 'captcha');

  try {
    await def.store(db, parsed.data);
  } catch {
    return fail(500, 'generic');
  }
  const cleanup = purge(db).catch(() => undefined);
  if (opts.waitUntil) opts.waitUntil(cleanup);
  else await cleanup;
  return ok();
}
