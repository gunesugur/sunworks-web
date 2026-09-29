import { z } from 'zod';

/** Removes control characters (keeps \n and \t in multi-line text) and trims. */
export function clean(value: string, multiline = false): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = code < 32 || code === 127;
    const keep = multiline && (code === 10 || code === 9);
    if (!isControl || keep) out += ch;
  }
  return out.trim();
}

const lang = z.enum(['tr', 'en']);
const email = z
  .string()
  .max(254)
  .transform((v) => clean(v).toLowerCase())
  .pipe(z.email());
const token = z.string().min(1).max(2048);
const honeypot = z.string().max(0).optional();

export const contactSchema = z.object({
  lang,
  name: z
    .string()
    .max(200)
    .transform((v) => clean(v))
    .pipe(z.string().min(2).max(80)),
  email,
  topic: z.enum(['wordpress', 'shopify', 'support', 'ai', 'other']),
  message: z
    .string()
    .max(8000)
    .transform((v) => clean(v, true))
    .pipe(z.string().min(10).max(4000)),
  consent: z.literal(true),
  website: honeypot,
  turnstileToken: token,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  lang,
  email,
  website: honeypot,
  turnstileToken: token,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

/** Only user-editable fields are reported; hidden/technical fields (honeypot, lang, token) never are. */
const REPORTABLE = new Set(['name', 'email', 'topic', 'message', 'consent']);

/** Field names (top-level) that failed validation; never echoes user input back. */
export function failedFields(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((i) => String(i.path[0] ?? '')).filter((f) => REPORTABLE.has(f)))];
}
