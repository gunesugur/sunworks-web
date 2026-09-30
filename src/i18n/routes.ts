import { LOCALES, type Locale } from '@/content/schema';

export const routes = {
  home: { tr: '/', en: '/en', de: '/de' },
  services: { tr: '/hizmetler', en: '/en/services', de: '/de/leistungen' },
  blog: { tr: '/blog', en: '/en/blog', de: '/de/blog' },
  contact: { tr: '/iletisim', en: '/en/contact', de: '/de/kontakt' },
  rss: { tr: '/rss.xml', en: '/en/rss.xml', de: '/de/rss.xml' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteName = keyof typeof routes;

export const servicePath = (lang: Locale, slug: string) => `${routes.services[lang]}/${slug}`;
export const postPath = (lang: Locale, slug: string) => `${routes.blog[lang]}/${slug}`;
export const pagePath = (lang: Locale, slug: string) => (lang === 'tr' ? `/${slug}` : `/${lang}/${slug}`);

/** Every locale except `lang`, in the site's order. */
export const otherLocales = (lang: Locale): Locale[] => LOCALES.filter((l) => l !== lang);

/** How each language names itself, for the language switch. */
export const localeNames: Record<Locale, { short: string; name: string; version: string }> = {
  tr: { short: 'TR', name: 'Türkçe', version: 'Türkçe sürüm' },
  en: { short: 'EN', name: 'English', version: 'English version' },
  de: { short: 'DE', name: 'Deutsch', version: 'Deutsche Version' },
};

/** Slug of the legal page with this translation key, per locale (links built outside the CMS). */
export const legalSlugs = {
  privacy: { tr: 'gizlilik', en: 'privacy', de: 'datenschutz' },
  cookies: { tr: 'cerez-politikasi', en: 'cookies', de: 'cookie-richtlinie' },
} as const satisfies Record<string, Record<Locale, string>>;

export const htmlLang: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US', de: 'de-DE' };
export const ogLocale: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US', de: 'de_DE' };

/** Locale-aware date, rendered at build time. */
export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** Normalizes build-time pathnames (`/blog.html`, `/en/index.html`, `/x/`) to public URLs (`/blog`, `/en`, `/x`). */
export function cleanPath(pathname: string): string {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');
  return p === '' || p === '/index' ? '/' : p;
}
