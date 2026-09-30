/**
 * §7 DoctorsShowcase — interior only (the rise over Journey / lift-off from Results are built by scenes.ts).
 * Selector: ARIA tablist (roving tabindex, ←/→/↑/↓/Home/End, automatic activation).
 * Switch: maskWipe(out, in, { forward: next > prev }) — directional clip-path, DURATION.wipe (650 ms);
 * name / specialty / bio: out opacity → 0 (220 ms), in y 8 → 0 + opacity (320 ms, 80 ms delay);
 * the ambient spill follows the selected doctor (data-ambient + ambientChanged()).
 * Reduced motion: opacity cross-fade (maskWipe reduce) and instant text swap fade.
 */
import { gsap, EASE, DURATION } from '../../motion/tokens';
import { prefersReducedMotion } from '../../motion/media';
import { maskWipe, ambientChanged } from '../../motion/scenes';

export function init(root: HTMLElement): () => void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-doctor-tab]'));
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-dlayer]'));
  const infos = Array.from(root.querySelectorAll<HTMLElement>('[data-dinfo]'));
  const panel = root.querySelector<HTMLElement>('[data-doctors-panel]');
  const tablist = root.querySelector<HTMLElement>('[data-doctors-tabs]');
  const current = root.querySelector<HTMLElement>('[data-doctors-current]');
  const count = tabs.length;
  if (count === 0 || layers.length !== count || infos.length !== count || !panel || !tablist) return () => undefined;

  let active = 0;
  let wipe: gsap.core.Timeline | null = null;
  let switches = 0;
  const parts = (el: HTMLElement): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('[data-dinfo-part]'));

  const select = (next: number, moveFocus = false): void => {
    if (next < 0 || next >= count) return;
    if (moveFocus) tabs[next]!.focus();
    if (next === active) return;
    wipe?.progress(1);
    const prev = active;
    active = next;
    const reduce = prefersReducedMotion();

    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === next));
      t.tabIndex = i === next ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tabs[next]!.id);
    if (current) current.textContent = String(next + 1).padStart(2, '0');
    layers.forEach((l, i) => {
      l.classList.toggle('is-active', i === next);
      if (i === next) l.removeAttribute('aria-hidden');
      else l.setAttribute('aria-hidden', 'true');
    });

    // portrait: directional mask wipe (primitive) — never wipe to an undecoded portrait (max 350 ms wait)
    const token = ++switches;
    const run = (): void => {
      if (token !== switches) return;
      const out = layers.find((l, i) => i !== next && getComputedStyle(l).zIndex === '2') ?? layers[prev]!;
      gsap.set(layers.filter((l, i) => i !== next && l !== out), { clipPath: 'inset(0% 0% 0% 100%)', zIndex: 0 });
      wipe = maskWipe(out, layers[next]!, { forward: next > prev, reduce });
    };
    const img = layers[next]!.querySelector<HTMLImageElement>('.dlayer__portrait img');
    if (img) {
      // clipped portraits may be loaded but not decoded yet: decode first (resolves at once when ready)
      img.loading = 'eager';
      void Promise.race([img.decode().catch(() => undefined), new Promise((r) => window.setTimeout(r, 350))]).then(run);
    } else run();

    // text: out quickly, in with a small rise
    const outParts = infos.filter((_, i) => i !== next && !infos[i]!.hidden).flatMap(parts);
    const inParts = parts(infos[next]!);
    gsap.killTweensOf(infos.flatMap(parts));
    gsap.to(outParts, {
      opacity: 0,
      duration: DURATION.fast,
      ease: EASE.soft,
      onComplete: () => {
        if (token !== switches) return;
        infos.forEach((info, i) => { info.hidden = i !== next; });
        gsap.set(outParts, { clearProps: 'opacity,transform' });
      },
    });
    infos[next]!.hidden = false;
    gsap.fromTo(
      inParts,
      { opacity: 0, y: reduce ? 0 : 8 },
      { opacity: 1, y: 0, duration: DURATION.ui, delay: 0.08, ease: EASE.primary, clearProps: 'transform' },
    );

    // ambient spill follows the selected clinician
    const key = layers[next]!.dataset.dlayer;
    if (key) {
      root.dataset.ambient = key;
      ambientChanged();
    }
  };

  const onClick = (e: Event): void => {
    const tab = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-doctor-tab]');
    if (tab) select(tabs.indexOf(tab));
  };
  const onKey = (e: KeyboardEvent): void => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const map: Record<string, number> = {
      ArrowRight: (i + 1) % count,
      ArrowDown: (i + 1) % count,
      ArrowLeft: (i - 1 + count) % count,
      ArrowUp: (i - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next, true);
  };
  tablist.addEventListener('click', onClick);
  tablist.addEventListener('keydown', onKey);

  // Clipped lazy portraits may never load on their own: fetch them once the scene is about a screen away,
  // so a switch never wipes to an empty frame (only doctor 01 is requested before that).
  const warm = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      root.querySelectorAll<HTMLImageElement>('.dlayer img').forEach((img) => (img.loading = 'eager'));
      warm.disconnect();
    },
    { rootMargin: '200% 0px' },
  );
  warm.observe(root);

  return () => {
    switches++;
    gsap.killTweensOf(infos.flatMap(parts));
    warm.disconnect();
    wipe?.kill();
    tablist.removeEventListener('click', onClick);
    tablist.removeEventListener('keydown', onKey);
  };
}
