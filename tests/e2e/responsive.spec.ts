import { expect, test } from '@playwright/test';
import { ROUTES, SKIP_INTRO } from './routes';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
});

for (const route of ROUTES) {
  test(`no horizontal overflow ${route.path}`, async ({ page }) => {
    await page.goto(route.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile menu opens, traps nothing and closes with Escape', async ({ page }, info) => {
  test.skip(Number(info.project.metadata['width']) > 900, 'desktop shows the nav inline');
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await expect(toggle).toBeVisible();
  await expect(page.locator('#site-nav a[href="/hizmetler"]')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-nav a[href="/hizmetler"]')).toBeVisible();
  await expect(page.locator('#site-nav a').first()).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('desktop nav is visible and marks the current page', async ({ page }, info) => {
  test.skip(Number(info.project.metadata['width']) <= 900, 'mobile uses the menu');
  await page.goto('/blog');
  await expect(page.locator('#site-nav a[aria-current="page"]')).toHaveText('Blog');
});
