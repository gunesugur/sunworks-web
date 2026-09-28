import type { ImageField } from '../schema';

/** Local image reference. Mirrors a Sanity image field; `image-local-*` refs resolve to src/assets/images. */
export function img(key: string, alt: string): ImageField {
  return { _type: 'image', asset: { _ref: `image-local-${key}` }, alt };
}

export function slug(current: string) {
  return { _type: 'slug' as const, current };
}
