import type { z } from 'zod';
import { checkRequest, fail, ok, readJson } from './http';
import { hit, purge, rateKey, type RateLimitOptions } from './rate-limit';
import { isTestSecret, verifyTurnstile } from './turnstile';
import { contactSchema, failedFields, newsletterSchema, type ContactInput, type NewsletterInput } from './validation';

export interface FormEnv {
  DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_SALT?: string;
  FORMS_ENABLED?: string;
  ALLOWED_ORIGINS?: string;
  /** "production" refuses Cloudflare's always-pass test secret. */
  ENVIRONMENT?: string;
  /** Optional override (e.g. a higher value for e2e runs). */
  RATE_LIMIT_MAX?: string;
}

const TEST_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

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

interface Ready {
  db: D1Database;
  secret: string;
  salt: string;
}

/** Returns the usable configuration, or null when forms must report "unavailable". */
function readyConfig(env: FormEnv): Ready | null {
  const { DB: db, TURNSTILE_SECRET_KEY: secret, RATE_LIMIT_SALT: salt } = env;
  if (env.FORMS_ENABLED !== 'true' || !db || !secret || !salt) return null;
  if (env.ENVIRONMENT === 'production' && isTestSecret(secret)) return null;
  return { db, secret, salt };
}

function limitFor(def: FormDef<unknown>, env: FormEnv): RateLimitOptions {
  const max = Number(env.RATE_LIMIT_MAX);
  return Number.isInteger(max) && max > 0 ? { ...def.limit, limit: max } : def.limit;
}

export async function handleForm<T extends { turnstileToken: string }>(
  def: FormDef<T>,
  request: Request,
  env: FormEnv,
  opts: HandleOptions = {},
): Promise<Response> {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  const rejected = checkRequest(request, allowed);
  if (rejected) return fail(rejected.status, rejected.error);

  const cfg = readyConfig(env);
  if (!cfg) return fail(503, 'unavailable');

  const ip = request.headers.get('CF-Connecting-IP');
  const cleanup = purge(cfg.db).catch(() => undefined);
  if (opts.waitUntil) opts.waitUntil(cleanup);
  else await cleanup;

  try {
    const key = await rateKey(cfg.salt, def.scope, ip ?? 'unknown');
    if (!(await hit(cfg.db, key, limitFor(def as FormDef<unknown>, env)))) return fail(429, 'rate');
  } catch {
    return fail(503, 'unavailable');
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return fail(400, 'validation');
  }
  const parsed = def.schema.safeParse(body);
  if (!parsed.success) return fail(400, 'validation', failedFields(parsed.error));

  // Cloudflare's test site keys produce this dummy token; with a real secret that means the
  // site key was never configured for this build — report "unavailable", not a captcha failure.
  if (parsed.data.turnstileToken === TEST_TOKEN && !isTestSecret(cfg.secret)) return fail(503, 'unavailable');

  const human = await verifyTurnstile(parsed.data.turnstileToken, {
    secret: cfg.secret,
    ip,
    hostname: new URL(request.url).hostname,
    ...(opts.fetcher ? { fetcher: opts.fetcher } : {}),
  });
  if (!human) return fail(403, 'captcha');

  try {
    await def.store(cfg.db, parsed.data);
  } catch {
    return fail(500, 'generic');
  }
  return ok();
}
