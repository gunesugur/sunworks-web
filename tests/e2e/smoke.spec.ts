import { expect, test } from '@playwright/test';
import { ROUTES, SKIP_INTRO } from './routes';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
});

for (const route of ROUTES) {
  test(`smoke ${route.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    const res = await page.goto(route.path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', route.lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical ?? '').pathname).toBe(route.path);
    if (route.alt) {
      await expect(page.locator('link[rel="alternate"][hreflang="tr"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });
}

test('unknown URL serves the 404 page with a 404 status', async ({ page }) => {
  const res = await page.goto('/bu-sayfa-yok');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Sayfa bulunamadı');
});

test('language switch leads to the translated page', async ({ page }, info) => {
  const mobile = Number(info.project.metadata['width']) <= 900;
  const pick = async (lang: string) => {
    if (mobile) await page.locator('[data-menu-toggle]').click();
    await page.locator(mobile ? `a.menu-lang[hreflang="${lang}"]` : `header a.lang[hreflang="${lang}"]`).click();
  };
  await page.goto('/hizmetler/teknik-destek');
  await pick('en');
  await expect(page).toHaveURL(/\/en\/services\/technical-support$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await pick('de');
  await expect(page).toHaveURL(/\/de\/leistungen\/technischer-support$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE');
});

test('RSS feeds and sitemap are served', async ({ request }) => {
  for (const url of ['/rss.xml', '/en/rss.xml', '/de/rss.xml', '/sitemap-index.xml']) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(await res.text()).toContain('<?xml');
  }
  expect(await (await request.get('/rss.xml')).text()).toContain('wordpress-yayin-oncesi-kontrol-listesi');
});

test('robots.txt, security.txt and the web manifest are served', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://sunworks.studio/sitemap-index.xml');
  expect(await (await request.get('/.well-known/security.txt')).text()).toContain('Contact: mailto:hello@sunworks.studio');
  const manifest = (await (await request.get('/site.webmanifest')).json()) as { name: string };
  expect(manifest.name).toBe('SUN | WORKS');
});
