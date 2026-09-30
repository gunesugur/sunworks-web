export interface RouteCase {
  path: string;
  lang: 'tr-TR' | 'en-US' | 'de-DE';
  alt?: string;
}

export const ROUTES: RouteCase[] = [
  { path: '/', lang: 'tr-TR', alt: '/en' },
  { path: '/en', lang: 'en-US', alt: '/' },
  { path: '/hizmetler', lang: 'tr-TR', alt: '/en/services' },
  { path: '/en/services', lang: 'en-US', alt: '/hizmetler' },
  { path: '/hizmetler/wordpress-kurumsal-site', lang: 'tr-TR', alt: '/en/services/wordpress-business-website' },
  { path: '/en/services/shopify-store-setup', lang: 'en-US', alt: '/hizmetler/shopify-magaza-kurulumu' },
  { path: '/blog', lang: 'tr-TR', alt: '/en/blog' },
  { path: '/en/blog', lang: 'en-US', alt: '/blog' },
  { path: '/blog/wordpress-yayin-oncesi-kontrol-listesi', lang: 'tr-TR', alt: '/en/blog/wordpress-pre-launch-checklist' },
  { path: '/en/blog/wordpress-pre-launch-checklist', lang: 'en-US', alt: '/blog/wordpress-yayin-oncesi-kontrol-listesi' },
  { path: '/iletisim', lang: 'tr-TR', alt: '/en/contact' },
  { path: '/en/contact', lang: 'en-US', alt: '/iletisim' },
  { path: '/gizlilik', lang: 'tr-TR', alt: '/en/privacy' },
  { path: '/en/privacy', lang: 'en-US', alt: '/gizlilik' },
  { path: '/kullanim-kosullari', lang: 'tr-TR', alt: '/en/terms' },
  { path: '/en/terms', lang: 'en-US', alt: '/kullanim-kosullari' },
  { path: '/cerez-politikasi', lang: 'tr-TR', alt: '/en/cookies' },
  { path: '/en/cookies', lang: 'en-US', alt: '/cerez-politikasi' },
  { path: '/kunye', lang: 'tr-TR', alt: '/de/impressum' },
  { path: '/de', lang: 'de-DE', alt: '/' },
  { path: '/de/leistungen', lang: 'de-DE', alt: '/hizmetler' },
  { path: '/de/leistungen/technischer-support', lang: 'de-DE', alt: '/hizmetler/teknik-destek' },
  { path: '/de/blog', lang: 'de-DE', alt: '/blog' },
  { path: '/de/blog/vor-der-eroeffnung-ihres-shopify-shops', lang: 'de-DE', alt: '/blog/shopify-magaza-acmadan-once' },
  { path: '/de/kontakt', lang: 'de-DE', alt: '/iletisim' },
  { path: '/de/impressum', lang: 'de-DE', alt: '/kunye' },
  { path: '/de/datenschutz', lang: 'de-DE', alt: '/gizlilik' },
  { path: '/de/cookie-richtlinie', lang: 'de-DE', alt: '/cerez-politikasi' },
];

/** Skip the first-visit intro so tests start from the settled page. */
export const SKIP_INTRO = () => {
  try {
    sessionStorage.setItem('sw-intro', '1');
  } catch {
    /* ignore */
  }
};
