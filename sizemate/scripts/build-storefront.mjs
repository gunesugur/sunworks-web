// Bundles the storefront script into the theme extension's assets.
// Usage: node scripts/build-storefront.mjs [--check]
//   --check  fail if the committed bundle is out of date (used in CI)
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const outfile = `${root}extensions/sizemate-theme/assets/sizemate.js`;

const result = await build({
  entryPoints: [`${root}app/storefront/sizemate.ts`],
  bundle: true,
  format: "iife",
  target: ["es2020", "safari15"],
  tsconfig: `${root}tsconfig.json`,
  minify: true,
  legalComments: "none",
  write: false,
  banner: { js: "/* Sizemate storefront script. Built from app/storefront/sizemate.ts */" },
});
const code = result.outputFiles[0].text;

if (process.argv.includes("--check")) {
  const current = await readFile(outfile, "utf8").catch(() => "");
  if (current !== code) {
    console.error("assets/sizemate.js is out of date. Run: npm run build:storefront");
    process.exit(1);
  }
  console.log("assets/sizemate.js is up to date.");
} else {
  await writeFile(outfile, code);
  console.log(`Wrote ${outfile} (${(Buffer.byteLength(code) / 1024).toFixed(1)} KB)`);
}
