/**
 * Imports dist-sanity/seed.ndjson (from `npm run sanity:seed`) into a Sanity dataset over the HTTP API:
 * uploads `_sanityAsset` images, rewrites them to asset references, then createOrReplace()s every document.
 * Usage: SANITY_PROJECT_ID=… SANITY_DATASET=production SANITY_WRITE_TOKEN=… npm run sanity:import
 * The token is read from the environment only and is never written anywhere.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectId = process.env['SANITY_PROJECT_ID'] ?? '';
const dataset = process.env['SANITY_DATASET'] ?? 'production';
const token = process.env['SANITY_WRITE_TOKEN'] ?? '';
if (!/^[a-z0-9]+$/.test(projectId) || !token) throw new Error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN');

const api = `https://${projectId}.api.sanity.io/v2025-02-19`;
const auth = { Authorization: `Bearer ${token}` };
const uploaded = new Map<string, string>();

async function upload(fileUrl: string): Promise<string> {
  const cached = uploaded.get(fileUrl);
  if (cached) return cached;
  const path = fileURLToPath(fileUrl);
  if (!path.includes('/src/assets/images/')) throw new Error(`Refusing to upload outside src/assets/images: ${path}`);
  const res = await fetch(`${api}/assets/images/${dataset}?filename=${encodeURIComponent(basename(path))}`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'image/jpeg' },
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is checked to be inside src/assets/images above
    body: readFileSync(path),
  });
  if (!res.ok) throw new Error(`Upload failed for ${basename(path)}: ${res.status}`);
  const { document } = (await res.json()) as { document: { _id: string } };
  uploaded.set(fileUrl, document._id);
  console.log(`uploaded ${basename(path)} → ${document._id}`);
  return document._id;
}

async function resolveAssets(value: unknown): Promise<unknown> {
  if (Array.isArray(value)) return Promise.all(value.map(resolveAssets));
  if (!value || typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const asset = obj['_sanityAsset'];
  if (typeof asset === 'string' && asset.startsWith('image@')) {
    const rest = Object.fromEntries(Object.entries(obj).filter(([k]) => k !== '_sanityAsset'));
    return { ...rest, asset: { _type: 'reference', _ref: await upload(asset.slice('image@'.length)) } };
  }
  const entries = await Promise.all(Object.entries(obj).map(async ([k, v]) => [k, await resolveAssets(v)] as const));
  return Object.fromEntries(entries);
}

const docs = readFileSync('dist-sanity/seed.ndjson', 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line) as unknown);

const resolved = [];
for (const doc of docs) resolved.push(await resolveAssets(doc));

const res = await fetch(`${api}/data/mutate/${dataset}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations: resolved.map((d) => ({ createOrReplace: d })) }),
});
if (!res.ok) throw new Error(`Mutation failed: ${res.status} ${await res.text()}`);
console.log(`Imported ${resolved.length} documents into ${projectId}/${dataset}`);
