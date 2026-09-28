import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES, SKIP_INTRO } from './routes';

test.beforeEach(async ({ page }, info) => {
  test.skip(!info.project.name.startsWith('chromium'), 'axe runs once per width on Chromium');
  await page.addInitScript(SKIP_INTRO);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const route of [...ROUTES.map((r) => r.path), '/404']) {
  test(`axe ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
