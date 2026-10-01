// Builds the theme extension's assets from app/storefront/.
//   sizemate.ts      → assets/sizemate.js (bundled)
//   sizemate.css     → assets/sizemate.css (copied; the admin preview uses the same file)
//   diagrams/*.svg   → assets/diagram-*.svg (copied)
// The admin can't load files from extensions/ in development: `shopify app dev`
// serves /extensions/* itself. So the sources live in app/ and are copied here.
//
// Usage: node scripts/build-storefront.mjs [--check]
//   --check  fail if the committed assets are out of date (used in CI)
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = `${root}app/storefront/`;
const assets = `${root}extensions/sizemate-theme/assets/`;

const result = await build({
  entryPoints: [`${source}sizemate.ts`],
  bundle: true,
  format: "iife",
  target: ["es2020", "safari15"],
  tsconfig: `${root}tsconfig.json`,
  minify: true,
  legalComments: "none",
  write: false,
  banner: { js: "/* Sizemate storefront script. Built from app/storefront/sizemate.ts */" },
});

const outputs = new Map([["sizemate.js", result.outputFiles[0].text]]);
outputs.set("sizemate.css", await readFile(`${source}sizemate.css`, "utf8"));
for (const file of (await readdir(`${source}diagrams`)).filter((f) => f.endsWith(".svg"))) {
  outputs.set(`diagram-${file}`, await readFile(`${source}diagrams/${file}`, "utf8"));
}

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [name, content] of outputs) {
    const current = await readFile(`${assets}${name}`, "utf8").catch(() => "");
    if (current !== content) stale.push(name);
  }
  if (stale.length) {
    console.error(`Out of date in extensions/sizemate-theme/assets: ${stale.join(", ")}. Run: npm run build:storefront`);
    process.exit(1);
  }
  console.log("Theme extension assets are up to date.");
} else {
  for (const [name, content] of outputs) await writeFile(`${assets}${name}`, content);
  console.log(`Wrote ${outputs.size} files to extensions/sizemate-theme/assets`);
}
