import type { ImageMetadata } from 'astro';
import type { ImageField } from '@/content/schema';
import { sanityConfig } from './sanity';

const localImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

export type ResolvedImage =
  | { kind: 'local'; src: ImageMetadata; alt: string }
  | { kind: 'remote'; src: string; width: number; height: number; alt: string };

const LOCAL_PREFIX = 'image-local-';
const SANITY_REF = /^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/;

export function resolveImage(field: ImageField): ResolvedImage {
  return resolveRef(field.asset._ref, field.alt);
}

/** The dark mode twin of an image, if it has one. */
export function resolveDarkImage(field: ImageField): ResolvedImage | undefined {
  return field.dark ? resolveRef(field.dark.asset._ref, field.alt) : undefined;
}

function resolveRef(ref: string, alt: string): ResolvedImage {
  if (ref.startsWith(LOCAL_PREFIX)) {
    const key = ref.slice(LOCAL_PREFIX.length);
    const mod = Object.entries(localImages).find(([path]) => path.split('/').pop()?.replace(/\.\w+$/, '') === key);
    if (!mod) throw new Error(`Local image not found: ${key}`);
    return { kind: 'local', src: mod[1].default, alt };
  }
  const match = SANITY_REF.exec(ref);
  const cfg = sanityConfig();
  if (!match || !cfg) throw new Error(`Unresolvable image reference: ${ref}`);
  const [, id, w, h, ext] = match;
  return {
    kind: 'remote',
    src: `https://cdn.sanity.io/images/${cfg.projectId}/${cfg.dataset}/${id}-${w}x${h}.${ext}`,
    width: Number(w),
    height: Number(h),
    alt,
  };
}

/** Absolute 1200×630 URL of an image, for og:image and structured data. */
export async function shareImageUrl(field: ImageField, site: URL): Promise<string> {
  const img = resolveImage(field);
  if (img.kind === 'remote') return `${img.src}?w=1200&h=630&fit=crop&auto=format`;
  const { getImage } = await import('astro:assets');
  const out = await getImage({ src: img.src, width: 1200, height: 630, fit: 'cover', format: 'jpg' });
  return new URL(out.src, site).href;
}
