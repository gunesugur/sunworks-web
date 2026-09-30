/**
 * Section registry: `data-section="<name>"` → lazy module.
 * Contract: src/scripts/sections/<name>.ts exports
 *   export function init(root: HTMLElement): void | (() => void)
 * Section agents: add ONE line here for your module. Modules are initialised in DOM order.
 */
export type SectionInit = (root: HTMLElement) => void | (() => void);
export type SectionLoader = () => Promise<{ init: SectionInit }>;

export const registry: Record<string, SectionLoader> = {
  header: () => import('./header'),
  hero: () => import('./hero'),
  statement: () => import('./statement'),
  benefits: () => import('./benefits'),
  footer: () => import('./footer'),
  // services: () => import('./services'),
  // journey: () => import('./journey'),
  // doctors: () => import('./doctors'),
  // results: () => import('./results'),
  // faq: () => import('./faq'),
  // booking: () => import('./booking'),
};
