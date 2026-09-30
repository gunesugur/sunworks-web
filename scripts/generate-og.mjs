// Renders the Open Graph images and the touch icon with Playwright (run manually: node scripts/generate-og.mjs).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const font = readFileSync('node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2').toString('base64');
const fontLatin = readFileSync('node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2').toString('base64');
const sun = readFileSync('public/favicon.svg', 'utf8');

const copy = {
  tr: { line: 'WordPress ve Shopify için özenli web işçiliği', meta: 'Bursa · Web tasarım ve geliştirme stüdyosu' },
  en: { line: 'Careful web work for WordPress and Shopify', meta: 'Bursa · Web design and development studio' },
  de: { line: 'Sorgfältige Webarbeit für WordPress und Shopify', meta: 'Bursa · Studio für Webdesign und Entwicklung' },
};

const page = (lang) => `<!doctype html><html><head><style>
@font-face{font-family:PJ;src:url(data:font/woff2;base64,${fontLatin}) format('woff2');font-weight:200 800;unicode-range:U+0000-00FF}
@font-face{font-family:PJ;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 800;unicode-range:U+0100-02AF}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#12100D;color:#F5F6F7;font-family:PJ;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.brand{display:flex;align-items:center;gap:18px;font-size:34px;font-weight:700;letter-spacing:.02em}.brand svg{width:56px;height:56px}
h1{font-size:76px;line-height:1.12;font-weight:500;max-width:900px;letter-spacing:-.02em}
.meta{font-size:28px;color:#A6A6A5}.star{position:absolute;right:80px;bottom:60px;width:120px;height:120px;color:#1CDB9C}
.arc{position:absolute;right:-120px;top:-160px;width:520px;height:520px;border-radius:50%;border:2px solid #2a2825}
</style></head><body><div class="arc"></div><div class="brand">${sun}<span>SUN <span style="opacity:.5;font-weight:300">|</span> WORKS</span></div>
<h1>${copy[lang].line}</h1><p class="meta">${copy[lang].meta}</p>
<svg class="star" viewBox="0 0 40 40"><g stroke="currentColor" stroke-width="5.2" stroke-linecap="round"><path d="M20 5v30"/><path d="M7 12.5l26 15"/><path d="M7 27.5l26-15"/></g></svg></body></html>`;

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['tr', 'en', 'de']) {
  await p.setContent(page(lang));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `public/og/${lang}.png` });
}
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(`<body style="margin:0;background:#12100D;display:grid;place-items:center;width:180px;height:180px">${sun.replace('<svg', '<svg width="132" height="132"')}</body>`);
await p.screenshot({ path: 'public/apple-touch-icon.png' });
await browser.close();
console.log('OG images and touch icon written');
