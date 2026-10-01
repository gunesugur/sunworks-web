/**
 * The page script: extensions/sizemate-theme/assets/sizemate.js (built by
 * scripts/build-storefront.mjs; do not edit the built file).
 *
 * Kept tiny so product pages stay fast. It places the button and, when a
 * shopper reaches for it (hover, focus, touch or after the page is idle),
 * fetches the full runtime (assets/sizemate-runtime.js) from Shopify's CDN.
 */

import { placeEmbed } from "./placement";

interface Runtime {
  init: (root: HTMLElement, options?: { open?: boolean }) => void;
}

declare global {
  interface Window {
    SizemateRuntime?: Runtime;
  }
}

const BOUND = "sizemateBound";

function hasProfile(): boolean {
  try {
    return window.localStorage.getItem("sizemate:profile") !== null;
  } catch {
    return false;
  }
}
let loading: Promise<Runtime> | null = null;

function loadRuntime(src: string): Promise<Runtime> {
  if (window.SizemateRuntime) return Promise.resolve(window.SizemateRuntime);
  loading ??= new Promise<Runtime>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => (window.SizemateRuntime ? resolve(window.SizemateRuntime) : reject(new Error("Sizemate runtime missing")));
    script.onerror = () => {
      loading = null;
      reject(new Error("Sizemate runtime failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

function bind(root: HTMLElement): void {
  if (root.dataset[BOUND]) return;
  root.dataset[BOUND] = "true";
  if (root.dataset.sizemateSource === "embed") placeEmbed(root);
  if (!root.isConnected) return;

  const trigger = root.querySelector<HTMLButtonElement>("[data-sizemate-open]");
  const src = root.dataset.runtime;
  if (!trigger || !src) return;

  const warm = () => {
    loadRuntime(src).catch(() => undefined);
  };
  for (const type of ["pointerenter", "focus", "touchstart"]) trigger.addEventListener(type, warm, { once: true, passive: true });

  const first = (event: Event) => {
    event.preventDefault();
    trigger.removeEventListener("click", first);
    trigger.setAttribute("aria-busy", "true");
    loadRuntime(src)
      .then((runtime) => runtime.init(root, { open: true }))
      .catch(() => trigger.addEventListener("click", first))
      .finally(() => trigger.removeAttribute("aria-busy"));
  };
  trigger.addEventListener("click", first);

  // Size memory: a returning shopper sees their size on the button right away.
  if (root.hasAttribute("data-memory") && hasProfile()) {
    loadRuntime(src)
      .then((runtime) => {
        trigger.removeEventListener("click", first);
        runtime.init(root);
      })
      .catch(() => undefined);
    return;
  }

  // Fetch it in the background once the page has settled, so the first click is instant.
  const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 2500));
  idle(warm, { timeout: 4000 });
}

function bindAll(scope: ParentNode = document): void {
  for (const root of Array.from(scope.querySelectorAll<HTMLElement>("[data-sizemate]"))) bind(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => bindAll());
} else {
  bindAll();
}

// Theme editor: sections are re-rendered in place.
document.addEventListener("shopify:section:load", (event) => bindAll(event.target as ParentNode));
