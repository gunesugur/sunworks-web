import { defineConfig, devices } from "@playwright/test";

// Storefront tests render the theme extension with LiquidJS and drive it in a
// real browser; no Shopify store or app server is needed.
const browsers = (process.env.PW_BROWSERS ?? "chromium").split(",");
const executablePath = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(executablePath ? { launchOptions: { executablePath } } : {}) },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ].filter((project) => browsers.includes(project.name)),
});
