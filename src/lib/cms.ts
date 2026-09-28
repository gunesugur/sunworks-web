/**
 * Content access layer. Every getter validates with the zod schemas in src/content/schema.ts,
 * whether the data comes from Sanity (build-time GROQ) or from the local typed seed files.
 */
import { z } from 'zod';
import {
  homePageSchema,
  navigationSchema,
  pageSchema,
  postSchema,
  serviceSchema,
  siteSettingsSchema,
  type Locale,
} from '@/content/schema';
import { home, navigation, settings } from '@/content/data/site';
import { services } from '@/content/data/services';
import { posts } from '@/content/data/posts';
import { pages } from '@/content/data/pages';
import { groq, sanityConfig } from './sanity';

const sources = {
  siteSettings: { schema: siteSettingsSchema, local: settings },
  navigation: { schema: navigationSchema, local: navigation },
  homePage: { schema: homePageSchema, local: home },
  service: { schema: serviceSchema, local: services },
  post: { schema: postSchema, local: posts },
  page: { schema: pageSchema, local: pages },
} as const;

type Sources = typeof sources;
type DocType = keyof Sources;
type DocOf<T extends DocType> = z.infer<Sources[T]['schema']>;

const cache = new Map<DocType, Promise<unknown[]>>();

async function load<T extends DocType>(type: T): Promise<DocOf<T>[]> {
  let pending = cache.get(type);
  if (!pending) {
    const { schema, local } = sources[type];
    pending = sanityConfig()
      ? groq('*[_type == $type && !(_id in path("drafts.**"))]', { type }).then((r) => z.array(schema).parse(r))
      : Promise.resolve(z.array(schema).parse(local));
    cache.set(type, pending);
  }
  return (await pending) as DocOf<T>[];
}

async function single<T extends DocType>(type: T, lang: Locale): Promise<DocOf<T>> {
  const doc = (await load(type)).find((d) => d.language === lang);
  if (!doc) throw new Error(`Missing ${type} for ${lang}`);
  return doc;
}

export const getSettings = (lang: Locale) => single('siteSettings', lang);
export const getNavigation = (lang: Locale) => single('navigation', lang);
export const getHome = (lang: Locale) => single('homePage', lang);

export async function getServices(lang: Locale) {
  return (await load('service')).filter((s) => s.language === lang).sort((a, b) => a.order - b.order);
}

export async function getPosts(lang: Locale) {
  return (await load('post'))
    .filter((p) => p.language === lang)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPages(lang: Locale, kind?: 'contact' | 'legal') {
  return (await load('page')).filter((p) => p.language === lang && (!kind || p.kind === kind));
}

/** Find the translation of a document (document-level i18n via translationKey). */
export async function getTranslation<T extends 'service' | 'post' | 'page'>(
  type: T,
  translationKey: string,
  lang: Locale,
): Promise<DocOf<T> | undefined> {
  return (await load(type)).find((d) => d.translationKey === translationKey && d.language === lang);
}
