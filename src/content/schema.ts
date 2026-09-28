/**
 * Content model. These zod schemas mirror the Sanity schema types in /studio/schemaTypes
 * one-to-one (same _type names, same field names), so local content and Sanity content
 * are validated by the same code path.
 */
import { z } from 'zod';

export const LOCALES = ['tr', 'en'] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

const key = z.string().min(1);

export const imageSchema = z.object({
  _type: z.literal('image'),
  asset: z.object({ _ref: z.string().regex(/^image-[\w-]+$/) }),
  alt: z.string().min(1),
});
export type ImageField = z.infer<typeof imageSchema>;

const spanSchema = z.object({
  _type: z.literal('span'),
  _key: key,
  text: z.string(),
  marks: z.array(z.string()).default([]),
});

const linkMarkSchema = z.object({
  _type: z.literal('link'),
  _key: key,
  href: z.string().regex(/^(\/|https:\/\/|mailto:|#)/, 'Unsupported link protocol'),
});

export const blockSchema = z.object({
  _type: z.literal('block'),
  _key: key,
  style: z.enum(['normal', 'h2', 'h3', 'blockquote']).default('normal'),
  listItem: z.enum(['bullet', 'number']).optional(),
  level: z.number().int().min(1).max(3).optional(),
  markDefs: z.array(linkMarkSchema).default([]),
  children: z.array(spanSchema).min(1),
});
export type Block = z.infer<typeof blockSchema>;

export const portableTextSchema = z.array(blockSchema);
export type PortableText = z.infer<typeof portableTextSchema>;

export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().regex(/^(\/|https:\/\/|mailto:|#)/),
});
export type Link = z.infer<typeof linkSchema>;

export const seoSchema = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(170).optional(),
  })
  .default({});

const isSlug = (v: string) => /^[a-z0-9-]+$/.test(v) && !v.startsWith('-') && !v.endsWith('-') && !v.includes('--');
const slugSchema = z.object({
  _type: z.literal('slug'),
  current: z.string().min(1).max(96).refine(isSlug, 'Invalid slug'),
});

const baseDoc = {
  _id: z.string().min(1),
  language: localeSchema,
  translationKey: z.string().min(1),
};

export const iconNames = [
  'wordpress',
  'cart',
  'wrench',
  'code',
  'server',
  'book',
  'search',
  'chat',
  'check',
  'spark',
] as const;
export const iconSchema = z.enum(iconNames);
export type IconName = z.infer<typeof iconSchema>;

export const siteSettingsSchema = z.object({
  ...baseDoc,
  _type: z.literal('siteSettings'),
  siteName: z.string(),
  tagline: z.string(),
  email: z.email(),
  /** WhatsApp number in international format, digits only (e.g. 905550000000). */
  whatsapp: z.string().regex(/^\d{8,15}$/).optional(),
  city: z.string(),
  socials: z.array(
    z.object({
      platform: z.enum(['instagram', 'linkedin', 'github', 'x']),
      url: z.string().regex(/^(https:\/\/|#$)/, 'Use an https:// URL or # as a placeholder'),
    }),
  ),
  map: z.object({
    lat: z.number(),
    lng: z.number(),
    zoom: z.number().int().min(3).max(18),
    label: z.string(),
  }),
  newsletter: z.object({ title: z.string(), text: z.string() }),
  footerNote: z.string(),
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const navigationSchema = z.object({
  ...baseDoc,
  _type: z.literal('navigation'),
  header: z.array(linkSchema),
  cta: linkSchema,
  footerColumns: z.array(z.object({ _key: key, title: z.string(), links: z.array(linkSchema) })),
  legalLinks: z.array(linkSchema),
});
export type Navigation = z.infer<typeof navigationSchema>;

export const homePageSchema = z.object({
  ...baseDoc,
  _type: z.literal('homePage'),
  seo: seoSchema,
  hero: z.object({
    title: z.string(),
    note: z.string(),
    image: imageSchema,
    smallImage: imageSchema,
    tags: z.array(z.string()).max(6),
  }),
  tools: z.object({ title: z.string(), items: z.array(z.string()).min(3) }),
  intro: z.object({ title: z.string(), text: z.string(), cta: linkSchema }),
  duo: z.object({
    first: imageSchema,
    second: imageSchema,
    firstTag: z.string(),
    secondTag: z.string(),
    link: linkSchema,
  }),
  approach: z.object({
    title: z.string(),
    image: imageSchema,
    tag: z.string(),
    items: z.array(z.object({ _key: key, icon: iconSchema, title: z.string(), text: z.string() })),
    cta: linkSchema,
  }),
  servicesSection: z.object({ title: z.string(), text: z.string() }),
  process: z.object({
    title: z.string(),
    text: z.string(),
    steps: z.array(z.object({ _key: key, title: z.string(), text: z.string(), deliverables: z.array(z.string()).optional() })).min(3),
  }),
  /** Short commitments shown as counting figures between sections. */
  stats: z
    .object({
      items: z.array(z.object({ _key: key, value: z.number().int().nonnegative(), suffix: z.string().optional(), label: z.string() })).min(2).max(4),
    })
    .optional(),
  closing: z.object({ title: z.string(), image: imageSchema, tag: z.string(), cta: linkSchema }),
});
export type HomePage = z.infer<typeof homePageSchema>;

export const serviceSchema = z.object({
  ...baseDoc,
  _type: z.literal('service'),
  title: z.string(),
  slug: slugSchema,
  order: z.number().int(),
  icon: iconSchema,
  excerpt: z.string().max(220),
  image: imageSchema,
  deliverables: z.array(z.string()).min(1),
  body: portableTextSchema,
  seo: seoSchema,
});
export type Service = z.infer<typeof serviceSchema>;

export const postSchema = z.object({
  ...baseDoc,
  _type: z.literal('post'),
  title: z.string(),
  slug: slugSchema,
  publishedAt: z.iso.date(),
  updatedAt: z.iso.date().optional(),
  author: z.string(),
  excerpt: z.string().max(260),
  image: imageSchema,
  tags: z.array(z.string()),
  body: portableTextSchema,
  seo: seoSchema,
});
export type Post = z.infer<typeof postSchema>;

export const pageSchema = z.object({
  ...baseDoc,
  _type: z.literal('page'),
  kind: z.enum(['contact', 'legal']),
  title: z.string(),
  slug: slugSchema,
  intro: z.string().optional(),
  body: portableTextSchema,
  legalReviewRequired: z.boolean(),
  updatedAt: z.iso.date(),
  seo: seoSchema,
});
export type Page = z.infer<typeof pageSchema>;
