/**
 * Scenes 4–5 — Services panel + treatments accordion (motion kit §5).
 *
 * Panel: a RisingPanel — its rise over the Benefits stage (and Journey lying beneath it) is declared in markup
 * and built by motion/scenes.ts. This module only drives the list.
 *
 * Accordion (one open, default first):
 *  - FLIP: read visual rects (First) → toggle classes → read layout rects (Last) in one batch, then
 *    tween translate/scale + clip-path back to identity (collapsed 88 → active 208 px, 650 ms EASE.primary).
 *    The media also interpolates its corner radius (round thumb → 12 px image) in last-layout units, and the
 *    active title line-masks in (yPercent 105 → 0). Rows never animate height; interrupted
 *    transitions restart from the current visual state (rects include in-flight transforms).
 *  - Input: click / Enter / Space (native button), ArrowUp/Down/Home/End between headers,
 *  - Selection changes only on explicit activation; scrolling and hovering never replace it.
 *  - Reduced motion: instant switch with an opacity-only detail transition.
 */
import { gsap, ScrollTrigger, EASE, DURATION } from '../../motion/tokens';
import { withMotion } from '../../motion/media';
import { getLenis } from '../../motion/smooth-scroll';

const WIDE = '(min-width: 640px)';

interface Part {
  row: HTMLElement;
  trigger: HTMLButtonElement;
  media: HTMLElement;
  detail: HTMLElement;
  name: HTMLElement | null;
  title: HTMLElement | null;
  img: HTMLImageElement | null;
}
interface Snap {
  top: number;
  h: number;
  media: DOMRect;
  detail: DOMRect;
  name: DOMRect | null;
  radius: number;
}

export function init(root: HTMLElement): () => void {
  const list = root.querySelector<HTMLElement>('[data-svc-list]');
  const parts: Part[] = Array.from(root.querySelectorAll<HTMLElement>('[data-svc]')).flatMap((row) => {
    const trigger = row.querySelector<HTMLButtonElement>('[data-svc-trigger]');
    const media = row.querySelector<HTMLElement>('[data-svc-media]');
    const detail = row.querySelector<HTMLElement>('[data-svc-detail]');
    return trigger && media && detail ? [{ row, trigger, media, detail, name: row.querySelector<HTMLElement>('[data-svc-name]'), title: row.querySelector<HTMLElement>('[data-svc-title-inner]'), img: media.querySelector('img') }] : [];
  });
  if (!list || parts.length === 0) return () => undefined;

  const n = parts.length;
  const wide = window.matchMedia(WIDE);

  let current = Math.max(
    0,
    parts.findIndex((p) => p.row.classList.contains('is-open')),
  );
  let animate = false; // FLIP allowed (motion conditions)
  let flip: gsap.core.Tween | null = null;
  const clip = parts.map(() => 0); // live bottom clip inset per row (px; negative = extended)

  const setState = (next: number): void => {
    parts.forEach((p, i) => {
      const open = i === next;
      p.row.classList.toggle('is-open', open);
      p.trigger.setAttribute('aria-expanded', String(open));
    });
  };
  setState(current);

  const clearFlip = (): void => {
    flip?.kill();
    flip = null;
    parts.forEach((p, i) => {
      clip[i] = 0;
      p.row.style.transform = '';
      p.row.style.clipPath = '';
      p.media.style.transform = '';
      p.media.style.borderRadius = '';
      p.detail.style.transform = '';
      if (p.name) p.name.style.transform = '';
    });
  };

  // corner radius of the media in its own (untransformed) px — '50%' resolves against the layout width
  const radiusOf = (el: HTMLElement): number => {
    const raw = getComputedStyle(el).borderTopLeftRadius;
    const v = parseFloat(raw) || 0;
    return raw.endsWith('%') ? (v / 100) * el.offsetWidth : v;
  };
  const snap = (): Snap[] =>
    parts.map((p) => {
      const r = p.row.getBoundingClientRect();
      return {
        top: r.top,
        h: r.height,
        media: p.media.getBoundingClientRect(),
        detail: p.detail.getBoundingClientRect(),
        name: p.name?.getBoundingClientRect() ?? null,
        radius: radiusOf(p.media) * (p.media.offsetWidth > 0 ? p.media.getBoundingClientRect().width / p.media.offsetWidth : 1),
      };
    });

  const fadeDetails = (prev: number, next: number, withY: boolean): void => {
    const out = parts[prev]?.detail;
    const inn = parts[next]?.detail;
    if (out) gsap.to(out, { autoAlpha: 0, duration: DURATION.fast, ease: EASE.soft, overwrite: true });
    if (inn) {
      const inner = inn.firstElementChild;
      gsap.fromTo(
        inn,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: DURATION.medium, delay: withY ? 0.12 : 0, ease: EASE.soft, overwrite: true },
      );
      if (withY && inner) {
        gsap.fromTo(inner, { y: 14 }, { y: 0, duration: DURATION.medium, delay: 0.12, ease: EASE.primary, overwrite: true });
      }
    }
  };

  const activate = (next: number): void => {
    if (next === current || next < 0 || next >= n) return;
    const prev = current;
    current = next;

    if (!animate) {
      clearFlip();
      setState(next);
      fadeDetails(prev, next, false);
      return;
    }

    // FIRST — visual state (includes any in-flight FLIP transforms)
    const first = snap();
    const firstH = first.map((s, i) => s.h - clip[i]!);
    const listH = list.offsetHeight;
    clearFlip();
    setState(next);
    // LAST — one forced layout
    let last = snap();

    // Phones: keep the tapped card anchored when a card above it collapses.
    if (!wide.matches && prev < next) {
      const shift = last[next]!.top - first[next]!.top;
      if (Math.abs(shift) > 1) {
        const lenis = getLenis();
        const y = window.scrollY + shift;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        last = snap();
      }
    }

    // INVERT
    const plans = parts.map((p, i) => {
      const f = first[i]!;
      const l = last[i]!;
      const dy = f.top - l.top;
      const dClip = l.h - firstH[i]!;
      const fm = f.media;
      const lm = l.media;
      const mx = fm.left - lm.left;
      const my = fm.top - f.top - (lm.top - l.top);
      const ms = lm.width > 0 ? fm.width / lm.width : 1;
      const dx = f.detail.left - l.detail.left;
      const ddy = f.detail.top - f.top - (l.detail.top - l.top);
      const mediaMoves = Math.abs(mx) > 0.5 || Math.abs(my) > 0.5 || Math.abs(ms - 1) > 0.002;
      const detailMoves = Math.abs(dx) > 0.5 || Math.abs(ddy) > 0.5;
      const nx = f.name && l.name ? f.name.left - l.name.left : 0;
      // radius: first radius expressed in last-layout units (the element is scaled by ms while inverted)
      const r0 = ms > 0 ? f.radius / ms : f.radius;
      const r1 = l.radius;
      return { p, i, dy, dClip, mx, my, ms, dx, ddy, nx, r0, r1, mediaMoves, detailMoves };
    });

    const render = (k: number): void => {
      for (const pl of plans) {
        const { p, i } = pl;
        p.row.style.transform = pl.dy ? `translate3d(0, ${(pl.dy * k).toFixed(2)}px, 0)` : '';
        if (pl.dClip) {
          clip[i] = pl.dClip * k;
          p.row.style.clipPath = `inset(-8px -8px ${clip[i]!.toFixed(2)}px -8px)`;
        }
        if (pl.mediaMoves) {
          const s = 1 + (pl.ms - 1) * k;
          p.media.style.transform = `translate3d(${(pl.mx * k).toFixed(2)}px, ${(pl.my * k).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
          p.media.style.borderRadius = `${(pl.r1 + (pl.r0 - pl.r1) * k).toFixed(2)}px`;
        }
        if (pl.nx && p.name) p.name.style.transform = `translate3d(${(pl.nx * k).toFixed(2)}px, 0, 0)`;
        if (pl.detailMoves) p.detail.style.transform = `translate3d(${(pl.dx * k).toFixed(2)}px, ${(pl.ddy * k).toFixed(2)}px, 0)`;
      }
    };
    render(1);

    // PLAY
    const proxy = { k: 1 };
    flip = gsap.to(proxy, {
      k: 0,
      duration: DURATION.medium,
      ease: EASE.primary,
      onUpdate: () => render(proxy.k),
      onComplete: () => {
        clearFlip();
        // Phone cards differ slightly in height: keep downstream triggers exact.
        if (list.offsetHeight !== listH) ScrollTrigger.refresh();
      },
    });
    fadeDetails(prev, next, true);
    const title = parts[next]!.title;
    if (title) gsap.fromTo(title, { yPercent: 105 }, { yPercent: 0, duration: DURATION.medium, delay: 0.08, ease: EASE.primary, overwrite: true, clearProps: 'transform' });
    const img = parts[next]!.img;
    if (img) gsap.fromTo(img, { scale: 1.06 }, { scale: 1, duration: DURATION.large, ease: EASE.primary, clearProps: 'transform' });
  };

  // ---------------------------------------------------------------- input
  const offs: Array<() => void> = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ): void => {
    el.addEventListener(type, fn);
    offs.push(() => el.removeEventListener(type, fn));
  };

  parts.forEach((p, i) => {
    on(p.trigger, 'click', () => {
      activate(i);
    });
    on(p.trigger, 'keydown', (e) => {
      const keys: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: n - 1 };
      const target = keys[e.key];
      if (target === undefined) return;
      e.preventDefault();
      parts[(target + n) % n]?.trigger.focus();
    });
  });

  // ---------------------------------------------------------------- motion conditions
  const motion = withMotion(root, ({ desktop, mobile }) => {
    animate = desktop || mobile;
    return () => {
      animate = false;
      clearFlip();
      gsap.set(
        parts.flatMap((p) => [p.detail, p.detail.firstElementChild]).filter(Boolean),
        { clearProps: 'opacity,visibility,transform' },
      );
    };
  });

  return () => {
    motion();
    offs.forEach((off) => off());
  };
}
