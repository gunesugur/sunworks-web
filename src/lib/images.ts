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
  const ref = field.asset._ref;
  if (ref.startsWith(LOCAL_PREFIX)) {
    const key = ref.slice(LOCAL_PREFIX.length);
    const mod = Object.entries(localImages).find(([path]) => path.split('/').pop()?.replace(/\.\w+$/, '') === key);
    if (!mod) throw new Error(`Local image not found: ${key}`);
    return { kind: 'local', src: mod[1].default, alt: field.alt };
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
    alt: field.alt,
  };
}
