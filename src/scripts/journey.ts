import { prefersReducedMotion } from './reduced-motion';

const WIDE = '(min-width: 1101px)';
const SVG_NS = 'http://www.w3.org/2000/svg';
/** How far above each card's top edge the arc passes, in px. */
const RISE = 44;

type Point = { x: number; y: number };

/** Smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
function curve(pts: Point[]): string {
  const f = (n: number) => n.toFixed(1);
  const first = pts[0];
  if (!first) return '';
  let d = `M${f(first.x)} ${f(first.y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (!p1 || !p2) break;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

/**
 * "How we work": the sun from the logo climbs an arc over the rising step cards as the section
 * scrolls through the viewport, lighting each step it reaches. On narrow screens (no arc) steps
 * light up as they scroll into view. Reduced motion: everything lit, sun at the end.
 */
export function initJourney(): () => void {
  const root = document.querySelector<HTMLElement>('[data-journey]');
  const svg = root?.querySelector<SVGSVGElement>('[data-journey-path]');
  const sun = root?.querySelector<HTMLElement>('[data-journey-sun]');
  if (!root || !svg || !sun) return () => undefined;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const track = document.createElementNS(SVG_NS, 'path');
  const trail = document.createElementNS(SVG_NS, 'path');
  track.setAttribute('class', 'journey__track');
  trail.setAttribute('class', 'journey__trail');
  svg.replaceChildren(track, trail);

  const wide = window.matchMedia(WIDE);
  const still = prefersReducedMotion();
  let length = 0;
  let centres: number[] = [];
  let frame = 0;

  const layout = () => {
    if (!wide.matches) {
      root.classList.remove('has-arc');
      return;
    }
    // The arc's class adds the room above the cards and staggers them: set it before measuring.
    root.classList.add('has-arc');
    // Offsets (not client rects) so reveal and hover transforms on the cards don't bend the arc.
    const rise = RISE;
    const cards = steps.map((s) => ({ left: s.offsetLeft, top: s.offsetTop, width: s.offsetWidth }));
    centres = cards.map((c) => c.left + c.width / 2);
    const pts: Point[] = cards.map((c) => ({ x: c.left + c.width / 2, y: c.top - rise }));
    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];
    if (firstCard && lastCard) {
      pts.unshift({ x: firstCard.left + 8, y: firstCard.top + rise * 0.4 });
      pts.push({ x: lastCard.left + lastCard.width - 8, y: lastCard.top - rise * 1.6 });
    }
    // Drawn 1:1 in the root's coordinates (no viewBox scaling), so the sun and the arc always agree.
    svg.setAttribute('width', String(root.offsetWidth));
    svg.setAttribute('height', String(root.offsetHeight));
    const d = curve(pts);
    track.setAttribute('d', d);
    trail.setAttribute('d', d);
    length = trail.getTotalLength();
    trail.style.strokeDasharray = `${length}`;
  };

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    const rect = root.getBoundingClientRect();
    const progress = still ? 1 : Math.min(1, Math.max(0, (vh * 0.8 - rect.top) / (rect.height * 0.85)));
    if (root.classList.contains('has-arc') && length) {
      trail.style.strokeDashoffset = `${length * (1 - progress)}`;
      const pt = trail.getPointAtLength(length * progress);
      sun.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0) rotate(${(progress * 300).toFixed(0)}deg)`;
      steps.forEach((s, i) => s.classList.toggle('is-lit', still || pt.x >= (centres[i] ?? Infinity) - 2));
    } else {
      steps.forEach((s) => s.classList.toggle('is-lit', still || s.getBoundingClientRect().top < vh * 0.75));
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const relayout = () => {
    layout();
    update();
  };

  const ro = new ResizeObserver(relayout);
  // Border box: the arc's top padding changes the root's size without touching its content box.
  ro.observe(root, { box: 'border-box' });
  steps.forEach((s) => ro.observe(s));
  wide.addEventListener('change', relayout);
  if (!still) window.addEventListener('scroll', schedule, { passive: true });
  relayout();

  return () => {
    ro.disconnect();
    wide.removeEventListener('change', relayout);
    window.removeEventListener('scroll', schedule);
    cancelAnimationFrame(frame);
  };
}
