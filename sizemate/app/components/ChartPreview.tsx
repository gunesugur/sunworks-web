/**
 * Live preview of what shoppers see. It renders the theme extension's own
 * Liquid (snippets/sizemate-core.liquid) with LiquidJS and runs the storefront
 * script on it, inside a small mock product page that plays the part of the
 * theme. So the preview can't drift from the storefront: it is the storefront.
 */
import { useEffect, useMemo, useRef } from "react";
import { templates, translations } from "virtual:sizemate-storefront";

import { emptyAssignment, type SizeChart } from "../lib/chart";
import { createStorefrontEngine, renderCoreSync } from "../lib/liquid";
import type { PlanId } from "../lib/plans";
import { buildPublication } from "../lib/publish";
import type { AppearanceSettings } from "../lib/settings";
import type { UnitSystem } from "../lib/units";
import { init } from "../storefront/runtime";

let engine: ReturnType<typeof createStorefrontEngine> | null = null;
const getEngine = () => (engine ??= createStorefrontEngine(templates, translations));

const PRODUCT = { id: 1, title: "Preview", type: "", vendor: "", tags: [], collections: [] };

/**
 * @param trySettings Show the settings as chosen even where the plan doesn't
 *   include them yet (Appearance lets merchants try the design studio).
 */
export function renderPreviewHtml(chart: SizeChart, settings: AppearanceSettings, plan: PlanId, trySettings = false): string {
  const publication = buildPublication([{ ...chart, status: "active", assignment: emptyAssignment("all") }], settings, plan);
  if (trySettings) publication.config.settings = settings;
  return renderCoreSync(getEngine(), { publication, product: PRODUCT });
}

export interface ChartPreviewProps {
  chart: SizeChart;
  settings: AppearanceSettings;
  plan: PlanId;
  trySettings?: boolean;
}

/** The chart as the storefront renders it, opened in place. */
export function ChartPreview({ chart, settings, plan, trySettings = false }: ChartPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => renderPreviewHtml(chart, settings, plan, trySettings), [chart, settings, plan, trySettings]);
  // Keep the shopper's tab and units while the merchant edits.
  const state = useRef<{ tab?: string; system?: UnitSystem }>({});

  useEffect(() => {
    const container = ref.current;
    const root = container?.querySelector<HTMLElement>("[data-sizemate]");
    if (!container || !root) return;
    init(root, { preview: true, system: state.current.system });
    const tab = state.current.tab ? root.querySelector<HTMLButtonElement>(`[data-sizemate-tab="${state.current.tab}"]`) : null;
    tab?.click();
  }, [html]);

  const remember = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const tab = target.closest<HTMLElement>("[data-sizemate-tab]")?.dataset.sizemateTab;
    const system = target.closest<HTMLElement>("[data-sizemate-system]")?.dataset.sizemateSystem;
    if (tab) state.current.tab = tab;
    if (system === "metric" || system === "imperial") state.current.system = system;
  };

  return (
    // The preview's own buttons handle the keyboard; this only listens for clicks to remember state.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="sizemate-preview" ref={ref} onClick={remember} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export type StageScheme = "light" | "dark";

/**
 * A plain product page standing in for the merchant's theme, so the preview
 * shows theme matching: the chart picks up these fonts, colours and the
 * Add to cart button's style exactly as it does on the real store.
 */
export function PreviewStage({ scheme, compact = false, children }: { scheme: StageScheme; compact?: boolean; children: React.ReactNode }) {
  return (
    <div className={`sizemate-stage sizemate-stage--${scheme}${compact ? " sizemate-stage--compact" : ""}`} data-sizemate-stage>
      <div className="sizemate-stage-product">
        <div className="sizemate-stage-image" aria-hidden="true" />
        <div className="sizemate-stage-info">
          <h1 className="sizemate-stage-title">Linen overshirt</h1>
          <p className="sizemate-stage-price">€89.00</p>
          <div className="sizemate-stage-sizes" aria-hidden="true">
            {["XS", "S", "M", "L", "XL"].map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
          {children}
          <form action="/cart/add" onSubmit={(event) => event.preventDefault()}>
            <button type="submit" name="add" className="sizemate-stage-buy" tabIndex={-1}>
              Add to cart
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
