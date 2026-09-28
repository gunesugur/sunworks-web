import { expect, test } from '@playwright/test';
import { SKIP_INTRO } from './routes';

test.beforeEach(async ({ page }, info) => {
  test.skip(!info.project.name.endsWith('-1440') && !info.project.name.endsWith('-390'), 'forms run at two widths');
  await page.addInitScript(SKIP_INTRO);
});

test('contact form shows field errors for invalid input', async ({ page }) => {
  await page.goto('/iletisim');
  await page.locator('form[data-form="contact"] button[type="submit"]').click();
  await expect(page.locator('[data-error-for="name"]')).not.toBeEmpty();
  await expect(page.locator('#cf-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('form[data-form="contact"] [data-status]')).toHaveAttribute('data-state', 'error');
});

test('contact form submits and shows success only after the API confirms', async ({ page }) => {
  await page.goto('/iletisim');
  await page.fill('#cf-name', 'Test Kişi');
  await page.fill('#cf-email', 'test@example.com');
  await page.selectOption('#cf-topic', 'support');
  await page.fill('#cf-message', 'Playwright uçtan uca test mesajı.');
  await page.check('#cf-consent');
  const response = page.waitForResponse((r) => r.url().endsWith('/api/contact'));
  await page.locator('form[data-form="contact"] button[type="submit"]').click();
  expect((await response).status()).toBe(200);
  await expect(page.locator('form[data-form="contact"] [data-status]')).toHaveAttribute('data-state', 'ok', { timeout: 20_000 });
});

test('newsletter form subscribes', async ({ page }) => {
  await page.goto('/en');
  await page.fill('#nl-email', `e2e+${Date.now()}@example.com`);
  const response = page.waitForResponse((r) => r.url().endsWith('/api/newsletter'));
  await page.locator('form[data-form="newsletter"] button[type="submit"]').click();
  expect((await response).status()).toBe(200);
  await expect(page.locator('#nl-status')).toHaveText(/signed up/i, { timeout: 20_000 });
});

test('map loads only after an explicit click', async ({ page }) => {
  await page.goto('/iletisim');
  await expect(page.locator('#map iframe')).toHaveCount(0);
  await page.locator('[data-map-load]').click();
  await expect(page.locator('#map iframe')).toHaveAttribute('src', /openstreetmap\.org/);
});

test('service page CTA preselects the contact topic', async ({ page }) => {
  await page.goto('/hizmetler/shopify-magaza-kurulumu');
  await page.locator('.included a.btn').click();
  await expect(page).toHaveURL(/\/iletisim\?topic=shopify$/);
  await expect(page.locator('#cf-topic')).toHaveValue('shopify');
});
