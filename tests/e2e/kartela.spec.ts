import { expect, test } from '@playwright/test';
import { SKIP_INTRO } from './routes';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('a dealer signs in, sees their prices and sends an order to WhatsApp', async ({ page }) => {
  await page.goto('/kartela/demo');
  const card = page.locator('.kt-card', { hasText: 'HV-135' });
  await expect(card.locator('.kt-price')).toContainText('Bayi fiyatı');
  await expect(page.locator('[data-kt-orderbar]')).toBeHidden();

  await page.locator('#kt-code').fill('dnz-2041');
  await page.getByRole('button', { name: 'Giriş yap' }).click();
  await expect(page.locator('[data-kt-who]')).toContainText('Özdemir Tekstil');
  await expect(card.locator('.kt-price__value')).toHaveText('₺341');

  await card.getByRole('button', { name: 'Bir koli artır' }).click();
  await card.locator('[data-add]').click();
  await expect(page.locator('[data-kt-bar]')).toContainText('1 kalem · 2 koli');

  await page.locator('[data-kt-open]').click();
  const dialog = page.locator('[data-kt-dialog]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-kt-msg]')).toContainText('Bayi: Özdemir Tekstil (DNZ-2041)');
  await expect(dialog.locator('[data-kt-send]')).toHaveAttribute('href', /^https:\/\/wa\.me\/905550000000\?text=/);
  await dialog.getByRole('button', { name: 'Kapat' }).click();
  await expect(dialog).toBeHidden();
});

test('the free plan caps products and Pro unlocks bulk price updates', async ({ page }) => {
  await page.goto('/en/kartela/demo');
  await page.getByRole('tab', { name: 'Company panel' }).click();
  await expect(page.locator('[data-kt-count]')).toHaveText('12 / 20 products');
  const add = page.getByRole('button', { name: 'Add product' });
  for (let i = 0; i < 9; i += 1) await add.click();
  await expect(page.locator('[data-kt-products-msg]')).toContainText('up to 20 products');
  await expect(page.locator('[data-kt-count]')).toHaveText('20 / 20 products');
  await expect(page.getByRole('button', { name: 'Apply to all prices' })).toBeDisabled();

  await page.getByRole('button', { name: 'Pro', exact: true }).click();
  await page.locator('#kt-b-pct').fill('10');
  await page.getByRole('button', { name: 'Apply to all prices' }).click();
  await expect(page.locator('[data-kt-bulk-msg]')).toContainText('changed by 10%');
  await expect(page.locator('[data-pp="p1"]')).toHaveValue('160');

  // Changes survive a reload, and reset brings the sample back.
  await page.reload();
  await page.getByRole('tab', { name: 'Company panel' }).click();
  await expect(page.locator('[data-pp="p1"]')).toHaveValue('160');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('tab', { name: 'Company panel' }).click();
  await expect(page.locator('[data-pp="p1"]')).toHaveValue('145');
});

test('the PDF view lays out a cover and product pages', async ({ page }) => {
  await page.goto('/kartela/demo');
  await page.getByRole('tab', { name: 'PDF katalog' }).click();
  await expect(page.locator('.kt-sheet')).toHaveCount(3);
  await page.locator('[data-kt-pdf-group]').selectOption('dealer');
  await expect(page.locator('.kt-sheet').nth(1)).toContainText('₺109');
});
