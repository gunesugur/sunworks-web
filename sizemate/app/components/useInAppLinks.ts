import { useEffect } from "react";
import { useNavigate } from "react-router";

const POLARIS_LINK = /^S-(BUTTON|LINK|CLICKABLE|CLICKABLE-CHIP)$/;

/**
 * Opens in-app links on Polaris buttons and links with React Router.
 *
 * In an embedded app a full page load loses the session token and can leave a
 * blank frame, so links to /app/... must never fall through to the browser.
 * Links with a target (theme editor, plan picker) are left alone.
 */
export function useInAppLinks(): void {
  const navigate = useNavigate();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event
        .composedPath()
        .find((node): node is HTMLElement => node instanceof HTMLElement && POLARIS_LINK.test(node.tagName) && node.hasAttribute("href"));
      const href = link?.getAttribute("href");
      if (!link || !href?.startsWith("/app") || link.getAttribute("target")) return;
      event.preventDefault();
      event.stopPropagation();
      if (!link.hasAttribute("disabled")) navigate(href);
    };
    // Capture phase, so this runs before the element's own link handling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);
}
