import { defineConfig, devices } from '@playwright/test';

const WIDTHS = [390, 768, 1024, 1440] as const;
const BROWSERS = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
] as const;
const only = process.env['PW_BROWSERS']?.split(',');
const chromiumPath = process.env['PW_CHROMIUM_PATH'];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 4 : 2,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8788',
    trace: 'retain-on-failure',
  },
  projects: BROWSERS.filter((b) => !only || only.includes(b.name)).flatMap((b) =>
    WIDTHS.map((width) => ({
      name: `${b.name}-${width}`,
      use: {
        ...b.device,
        viewport: { width, height: 900 },
        ...(b.name === 'chromium' && chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
      },
      metadata: { width },
    })),
  ),
  webServer: {
    command: 'npx wrangler dev --port 8788 --ip 127.0.0.1',
    url: 'http://127.0.0.1:8788',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
