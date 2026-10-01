// Builds the theme extension's assets from app/.
//   app/storefront/sizemate.ts  → assets/sizemate.js (bundled; the small page script)
//   app/storefront/runtime-entry.ts → assets/sizemate-runtime.js (bundled; loaded on demand)
//   app/storefront/sizemate.css → assets/sizemate.css (copied; the admin preview uses the same file)
//   app/lib/figures.ts          → snippets/sizemate-figure.liquid (generated)
// The admin can't load files from extensions/ in development: `shopify app dev`
// serves /extensions/* itself. So the sources live in app/ and are copied here.
//
// Usage: node scripts/build-storefront.mjs [--check]
//   --check  fail if the committed files are out of date (used in CI)
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = `${root}app/storefront/`;
const extension = `${root}extensions/sizemate-theme/`;

const bundle = (entry, name) =>
  build({
    entryPoints: [`${source}${entry}`],
    bundle: true,
    format: "iife",
    target: ["es2020", "safari15"],
    tsconfig: `${root}tsconfig.json`,
    minify: true,
    legalComments: "none",
    write: false,
    banner: { js: `/* Sizemate ${name}. Built from app/storefront/${entry} */` },
  });
const script = await bundle("sizemate.ts", "page script");
const runtime = await bundle("runtime-entry.ts", "runtime");

// figures.ts is TypeScript: bundle it to a module in memory and import that.
const figures = await build({
  entryPoints: [`${root}app/lib/figures.ts`],
  bundle: true,
  format: "esm",
  platform: "neutral",
  tsconfig: `${root}tsconfig.json`,
  write: false,
});
const { figureLiquid } = await import(`data:text/javascript;base64,${Buffer.from(figures.outputFiles[0].text).toString("base64")}`);

const outputs = new Map([
  ["assets/sizemate.js", script.outputFiles[0].text],
  ["assets/sizemate-runtime.js", runtime.outputFiles[0].text],
  ["assets/sizemate.css", await readFile(`${source}sizemate.css`, "utf8")],
  ["snippets/sizemate-figure.liquid", figureLiquid()],
]);

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [name, content] of outputs) {
    const current = await readFile(`${extension}${name}`, "utf8").catch(() => "");
    if (current !== content) stale.push(name);
  }
  if (stale.length) {
    console.error(`Out of date in extensions/sizemate-theme: ${stale.join(", ")}. Run: npm run build:storefront`);
    process.exit(1);
  }
  console.log("Theme extension files are up to date.");
} else {
  for (const [name, content] of outputs) await writeFile(`${extension}${name}`, content);
  console.log(`Wrote ${outputs.size} files to extensions/sizemate-theme`);
}
