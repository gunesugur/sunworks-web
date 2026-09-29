import rss from '@astrojs/rss';
import type { Locale } from '@/content/schema';
import { getPosts, getSettings } from '@/lib/cms';
import { postPath, routes } from '@/i18n/routes';
import { t } from '@/i18n/ui';

export async function rssFeed(lang: Locale, site: URL | undefined): Promise<Response> {
  const [settings, posts] = await Promise.all([getSettings(lang), getPosts(lang)]);
  return rss({
    title: `${settings.siteName} · ${t(lang).blogTitle}`,
    description: t(lang).blogIntro,
    site: new URL(routes.blog[lang], site ?? 'https://sunworks.studio').href,
    items: posts.map((p) => ({
      title: p.title,
      description: p.excerpt,
      pubDate: new Date(`${p.publishedAt}T00:00:00Z`),
      link: postPath(lang, p.slug.current),
      categories: p.tags,
      author: `${settings.email} (${p.author})`,
    })),
    customData: `<language>${lang}</language>`,
  });
}
