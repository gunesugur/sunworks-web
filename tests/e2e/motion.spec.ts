import { expect, test } from '@playwright/test';

test('first visit plays the intro, then gets out of the way', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/intro/);
  const intro = page.locator('[data-intro]');
  await expect(intro).toBeVisible();
  await expect(intro).toBeHidden({ timeout: 5000 });
  await page.goto('/hizmetler');
  await expect(page.locator('html')).not.toHaveClass(/intro/);
});

test('reduced motion: no intro, all reveal content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/intro/);
  const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
});

test('without JavaScript every section is visible', async ({ browser }) => {
  // No preset storage: seeding localStorage needs script, which would stall this context in Firefox.
  const ctx = await browser.newContext({ javaScriptEnabled: false, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#services-title')).toBeVisible();
  const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
  await ctx.close();
});

test('cumulative layout shift stays at ~0 while scrolling the home page', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'layout-shift entries are Chromium-only');
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await expect(page.locator('[data-intro]')).toBeHidden({ timeout: 5000 });
  for (let y = 0; y < 8000; y += 500) {
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.min(y + 500, 1));
  }
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.02);
});

test('notched images get a computed clip-path', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => page.locator('.notched__media[style*="clip-path"]').count()).toBeGreaterThan(5);
});

test('page transitions keep the router working (back/forward)', async ({ page }, info) => {
  test.skip(Number(info.project.metadata['width']) <= 900, 'uses the desktop nav');
  await page.addInitScript(() => sessionStorage.setItem('sw-intro', '1'));
  await page.goto('/');
  await page.locator('#site-nav a[href="/blog"]').click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.locator('h1')).toContainText('Blog');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('any key skips the intro and the page is not inert afterwards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/intro/);
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).not.toHaveClass(/intro/);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

test('tools marquee can be paused with a button (WCAG 2.2.2)', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('sw-intro', '1'));
  await page.goto('/');
  const toggle = page.locator('[data-marquee-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-marquee]')).toHaveClass(/is-paused/);
});

test('how-we-work follows the scroll: the step under the reading line is active and counted', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('sw-intro', '1'));
  await page.goto('/');
  const steps = page.locator('[data-journey] [data-step]');
  await expect(steps).toHaveCount(3);
  await steps.last().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: 'instant' }));
  await expect(steps.last()).toHaveClass(/is-active/);
  await expect(steps.first()).not.toHaveClass(/is-active/);
  await expect(page.locator('[data-journey-now]')).toHaveText('03');
});
