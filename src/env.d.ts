/// <reference types="astro/client" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    TURNSTILE_SECRET_KEY?: string;
    RATE_LIMIT_SALT?: string;
    FORMS_ENABLED?: string;
    ALLOWED_ORIGINS?: string;
    RATE_LIMIT_MAX?: string;
  }
}

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
