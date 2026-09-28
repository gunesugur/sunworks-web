import type { Locale } from '@/content/schema';

export const routes = {
  home: { tr: '/', en: '/en' },
  services: { tr: '/hizmetler', en: '/en/services' },
  blog: { tr: '/blog', en: '/en/blog' },
  contact: { tr: '/iletisim', en: '/en/contact' },
  rss: { tr: '/rss.xml', en: '/en/rss.xml' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteName = keyof typeof routes;

export const servicePath = (lang: Locale, slug: string) => `${routes.services[lang]}/${slug}`;
export const postPath = (lang: Locale, slug: string) => `${routes.blog[lang]}/${slug}`;
export const pagePath = (lang: Locale, slug: string) => (lang === 'tr' ? `/${slug}` : `/en/${slug}`);

export const otherLocale = (lang: Locale): Locale => (lang === 'tr' ? 'en' : 'tr');

export const htmlLang: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' };
export const ogLocale: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US' };

/** Locale-aware date, rendered at build time. */
export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}
