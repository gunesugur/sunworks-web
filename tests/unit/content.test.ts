import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { z } from 'zod';
import { pt } from '../../src/content/pt';
import { homePageSchema, navigationSchema, pageSchema, postSchema, serviceSchema, siteSettingsSchema } from '../../src/content/schema';
import { home, navigation, settings } from '../../src/content/data/site';
import { services } from '../../src/content/data/services';
import { posts } from '../../src/content/data/posts';
import { pages } from '../../src/content/data/pages';

test('local content matches the Sanity-mirroring schemas', () => {
  assert.ok(z.array(siteSettingsSchema).safeParse(settings).success);
  assert.ok(z.array(navigationSchema).safeParse(navigation).success);
  assert.ok(z.array(homePageSchema).safeParse(home).success);
  assert.ok(z.array(serviceSchema).safeParse(services).success);
  assert.ok(z.array(postSchema).safeParse(posts).success);
  assert.ok(z.array(pageSchema).safeParse(pages).success);
});

test('every document has a TR and an EN version', () => {
  const all = [...settings, ...navigation, ...home, ...services, ...posts, ...pages];
  const byKey = new Map<string, Set<string>>();
  for (const d of all) byKey.set(d.translationKey, (byKey.get(d.translationKey) ?? new Set()).add(d.language));
  for (const [key, langs] of byKey) assert.deepEqual([...langs].sort(), ['de', 'en', 'tr'], key);
});

test('slugs are unique per language and type', () => {
  for (const list of [services, posts, pages]) {
    for (const lang of ['tr', 'en', 'de']) {
      const slugs = list.filter((d) => d.language === lang).map((d) => d.slug.current);
      assert.equal(new Set(slugs).size, slugs.length);
    }
  }
});

test('legal pages are flagged for legal review', () => {
  for (const p of pages.filter((x) => x.kind === 'legal')) assert.equal(p.legalReviewRequired, true, p._id);
});

test('content avoids claims the brief rules out', () => {
  const text = JSON.stringify([settings, navigation, home, services, posts, pages]).toLowerCase();
  for (const banned of ['gdpr-compliant', 'kvkk uyumlu', 'certified', 'sertifikalı', 'award', 'ödül', 'testimonial', 'garanti', 'guarantee', 'our team', 'ekibimiz']) {
    assert.ok(!text.includes(banned), banned);
  }
});

test('pt() parses headings, lists and inline marks in linear time', () => {
  const blocks = pt('x', '## Title\n\nHello **bold** and *em* with `code` and [a link](/path).\n\n- one\n- two');
  assert.equal(blocks[0]?.style, 'h2');
  const para = blocks[1];
  assert.ok(para);
  assert.deepEqual(
    para.children.map((c) => [c.text, c.marks.length ? c.marks[0] : '']),
    [
      ['Hello ', ''],
      ['bold', 'strong'],
      [' and ', ''],
      ['em', 'em'],
      [' with ', ''],
      ['code', 'code'],
      [' and ', ''],
      ['a link', 'x1m7'],
      ['.', ''],
    ],
  );
  assert.equal(para.markDefs[0]?.href, '/path');
  assert.equal(blocks[2]?.listItem, 'bullet');
  const start = performance.now();
  pt('y', `${'*'.repeat(20000)}[`.repeat(2));
  assert.ok(performance.now() - start < 500);
});

test('every local image has a dark twin of the same size', async () => {
  const { default: sharp } = await import('sharp');
  const { existsSync } = await import('node:fs');
  const refs = new Set<string>();
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (o['_type'] === 'image' && o['alt']) refs.add(String((o['asset'] as { _ref: string })._ref));
      Object.values(o).forEach(walk);
    }
  };
  walk([home, services, posts]);
  assert.ok(refs.size > 0);
  for (const ref of refs) {
    const key = ref.replace('image-local-', '');
    const light = `src/assets/images/${key}.webp`;
    const dark = `src/assets/images/${key}-dark.webp`;
    assert.ok(existsSync(light) && existsSync(dark), key);
    const [a, b] = await Promise.all([sharp(light).metadata(), sharp(dark).metadata()]);
    assert.deepEqual([a.width, a.height], [b.width, b.height], key);
  }
});
