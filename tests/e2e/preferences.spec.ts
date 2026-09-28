import { expect, test, type Page } from '@playwright/test';
import { SKIP_INTRO } from './routes';

const html = (page: Page) => page.locator('html');

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_INTRO);
  });

  test('follows the system setting until the visitor picks one', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#12100d');
  });

  test('the toggle switches theme and the choice survives navigation and reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    await page.locator('[data-theme-toggle]').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAccessibleName(/Açık temaya geç/);
    await page.goto('/blog');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('accessibility panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_INTRO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
  });

  test('opens from the launcher, applies settings and closes with Escape', async ({ page }) => {
    const launcher = page.locator('[data-a11y-launcher]');
    const panel = page.getByRole('dialog', { name: 'Görünümü size göre ayarlayın' });
    await launcher.click();
    await expect(panel).toBeVisible();
    await expect(launcher).toHaveAttribute('aria-expanded', 'true');

    await panel.getByRole('switch', { name: 'Bağlantıların altını çiz' }).click();
    await expect(html(page)).toHaveAttribute('data-links', 'underline');
    await panel.getByRole('button', { name: 'Yazıyı büyüt' }).click();
    await expect(html(page)).toHaveAttribute('data-text', '1');
    await panel.getByText('Koyu', { exact: true }).click();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(launcher).toBeFocused();

    await page.goto('/hizmetler');
    await expect(html(page)).toHaveAttribute('data-links', 'underline');
    await expect(html(page)).toHaveAttribute('data-text', '1');
  });

  test('reset returns every setting to its default', async ({ page }) => {
    await page.locator('[data-a11y-launcher]').click();
    const panel = page.getByRole('dialog', { name: 'Görünümü size göre ayarlayın' });
    await panel.getByRole('switch', { name: 'Yüksek kontrast' }).click();
    await panel.getByRole('switch', { name: 'Animasyonları durdur' }).click();
    await expect(html(page)).toHaveAttribute('data-contrast', 'more');
    await panel.getByRole('button', { name: 'Varsayılana dön' }).click();
    await expect(html(page)).not.toHaveAttribute('data-contrast', /.+/);
    await expect(html(page)).not.toHaveAttribute('data-motion', /.+/);
    expect(await page.evaluate(() => localStorage.getItem('sw-prefs'))).toBeNull();
  });
});

test.describe('cookie consent', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(SKIP_INTRO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('asks on the first visit; "necessary only" keeps the map off', async ({ page }) => {
    await page.goto('/iletisim');
    const banner = page.getByRole('dialog', { name: 'Çerez tercihleri' });
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Yalnızca zorunlu' }).click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sw-consent') ?? 'null') as { functional: boolean } | null);
    expect(stored?.functional).toBe(false);
    await expect(page.locator('[data-map] iframe')).toHaveCount(0);
    await page.reload();
    await expect(banner).toBeHidden();
  });

  test('accepting loads the map by itself; choices can be changed from the footer', async ({ page }) => {
    await page.goto('/iletisim');
    await page.getByRole('button', { name: 'Tümünü kabul et' }).click();
    await expect(page.locator('[data-map] iframe')).toHaveAttribute('src', /^https:\/\/www\.openstreetmap\.org\//);

    await page.getByRole('button', { name: 'Çerez tercihleri' }).click();
    const functional = page.getByRole('switch', { name: 'İşlevsel' });
    await expect(functional).toHaveAttribute('aria-checked', 'true');
    await functional.click();
    await page.getByRole('button', { name: 'Seçimi kaydet' }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sw-consent') ?? 'null') as { functional: boolean } | null);
    expect(stored?.functional).toBe(false);
  });
});

test('the header hides on scroll down and returns on scroll up', async ({ page }, info) => {
  test.skip(Number(info.project.metadata['width']) <= 900, 'desktop header');
  await page.addInitScript(SKIP_INTRO);
  await page.goto('/');
  const header = page.locator('[data-header]');
  await page.mouse.wheel(0, 1200);
  await expect(header).toHaveClass(/is-scrolled/);
  await expect(header).toHaveClass(/is-hidden/);
  await page.mouse.wheel(0, -300);
  await expect(header).not.toHaveClass(/is-hidden/);
});
