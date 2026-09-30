import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Kept apart from vite.config.ts so the React Router plugin doesn't run under test.
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    environment: "node",
    restoreMocks: true,
  },
});
