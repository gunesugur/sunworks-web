import type { ImageField } from '../schema';

/**
 * Local image reference. Mirrors a Sanity image field; `image-local-*` refs resolve to src/assets/images.
 * Every local image has a `<key>-dark` twin for dark mode.
 */
export function img(key: string, alt: string): ImageField {
  return {
    _type: 'image',
    asset: { _ref: `image-local-${key}` },
    alt,
    dark: { _type: 'image', asset: { _ref: `image-local-${key}-dark` } },
  };
}

export function slug(current: string) {
  return { _type: 'slug' as const, current };
}
