/**
 * Exports the local typed content as NDJSON for `sanity dataset import`.
 * Local image refs become `_sanityAsset` file references, so the import uploads the images too.
 * Usage: npm run sanity:seed  →  dist-sanity/seed.ndjson
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { home, navigation, settings } from '../src/content/data/site';
import { services } from '../src/content/data/services';
import { posts } from '../src/content/data/posts';
import { pages } from '../src/content/data/pages';

const IMAGE_DIR = resolve('src/assets/images');
const files = readdirSync(IMAGE_DIR);

function imageFile(key: string): string {
  const file = files.find((f) => f.replace(/\.\w+$/, '') === key);
  if (!file) throw new Error(`Missing image ${key}`);
  return pathToFileURL(resolve(IMAGE_DIR, file)).href;
}

function transform(value: unknown, keyHint = 'k'): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) => {
      const out = transform(item, `${keyHint}${i}`);
      if (out && typeof out === 'object' && !Array.isArray(out) && !('_key' in out)) {
        return { _key: `${keyHint}${i}`, ...out };
      }
      return out;
    });
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const asset = obj['asset'] as { _ref?: string } | undefined;
    if (obj['_type'] === 'image' && asset?._ref?.startsWith('image-local-')) {
      return { _type: 'image', alt: obj['alt'], _sanityAsset: `image@${imageFile(asset._ref.slice('image-local-'.length))}` };
    }
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, transform(v, k.slice(0, 3))]));
  }
  return value;
}

const all = [...settings, ...navigation, ...home, ...services, ...posts, ...pages];
const docs: unknown[] = all.map((d) => transform(d));

// Link translations for @sanity/document-internationalization (Studio "Translations" menu).
const groups = new Map<string, typeof all>();
for (const d of all) groups.set(d.translationKey, [...(groups.get(d.translationKey) ?? []), d]);
for (const [key, group] of groups) {
  docs.push({
    _id: `translation.metadata.${key}`,
    _type: 'translation.metadata',
    schemaTypes: [...new Set(group.map((d) => d._type))],
    translations: group.map((d) => ({ _key: d.language, _type: 'internationalizedArrayReferenceValue', value: { _type: 'reference', _ref: d._id, _weak: true } })),
  });
}
mkdirSync('dist-sanity', { recursive: true });
writeFileSync('dist-sanity/seed.ndjson', `${docs.map((d) => JSON.stringify(d)).join('\n')}\n`);
console.log(`Wrote ${docs.length} documents to dist-sanity/seed.ndjson`);
