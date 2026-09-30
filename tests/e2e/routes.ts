export interface RouteCase {
  path: string;
  lang: 'tr-TR' | 'en-US';
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
  { path: '/kartela', lang: 'tr-TR', alt: '/en/kartela' },
  { path: '/en/kartela', lang: 'en-US', alt: '/kartela' },
  { path: '/kartela/demo', lang: 'tr-TR', alt: '/en/kartela/demo' },
  { path: '/en/kartela/demo', lang: 'en-US', alt: '/kartela/demo' },
  { path: '/iletisim', lang: 'tr-TR', alt: '/en/contact' },
  { path: '/en/contact', lang: 'en-US', alt: '/iletisim' },
  { path: '/gizlilik', lang: 'tr-TR', alt: '/en/privacy' },
  { path: '/en/privacy', lang: 'en-US', alt: '/gizlilik' },
  { path: '/kullanim-kosullari', lang: 'tr-TR', alt: '/en/terms' },
  { path: '/en/terms', lang: 'en-US', alt: '/kullanim-kosullari' },
  { path: '/cerez-politikasi', lang: 'tr-TR', alt: '/en/cookies' },
  { path: '/en/cookies', lang: 'en-US', alt: '/cerez-politikasi' },
];

/** Skip the first-visit intro so tests start from the settled page. */
export const SKIP_INTRO = () => {
  try {
    sessionStorage.setItem('sw-intro', '1');
  } catch {
    /* ignore */
  }
};
