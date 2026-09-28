import { notchPath, type Corner } from '@/lib/notch';

const CORNERS = new Set<Corner>(['tl', 'tr', 'bl', 'br']);
const supportsPath = () => CSS.supports('clip-path', 'path("M0 0")');

function apply(root: HTMLElement) {
  const media = root.querySelector<HTMLElement>('[data-notch-media]');
  const slot = root.querySelector<HTMLElement>('[data-notch-slot]');
  const corner = root.dataset['notch'] as Corner | undefined;
  if (!media || !slot || !corner || !CORNERS.has(corner)) return;
  const radius = Number.parseFloat(getComputedStyle(media).borderTopLeftRadius) || 0;
  const d = notchPath(media.clientWidth, media.clientHeight, slot.offsetWidth, slot.offsetHeight, radius, corner);
  if (d) media.style.clipPath = `path("${d}")`;
}

export function initNotches(): () => void {
  if (!('ResizeObserver' in window) || !supportsPath()) return () => undefined;
  const roots = [...document.querySelectorAll<HTMLElement>('[data-notch]')];
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const root = (entry.target as HTMLElement).closest<HTMLElement>('[data-notch]');
      if (root) apply(root);
    }
  });
  for (const root of roots) {
    const media = root.querySelector('[data-notch-media]');
    const slot = root.querySelector('[data-notch-slot]');
    if (media) ro.observe(media);
    if (slot) ro.observe(slot);
    apply(root);
  }
  return () => ro.disconnect();
}
