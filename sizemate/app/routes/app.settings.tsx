import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";

import { ChartPreview } from "../components/ChartPreview";
import { FeatureBadge, UpgradeCallout, valueOf, valuesOf } from "../components/ui";
import { hasFeature } from "../lib/plans";
import { effectiveSettings, lockedSettingsInUse, settingsSchema, type AppearanceSettings } from "../lib/settings";
import { chartFromTemplate, getTemplate } from "../lib/templates";
import { listCharts } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { publish } from "../models/publisher.server";
import { getShop, saveSettings, settingsOf } from "../models/shop.server";
import { themeEditorLinks } from "../models/theme.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan } = await adminContext(request);
  const [record, charts] = await Promise.all([getShop(shop), listCharts(shop)]);
  return {
    plan,
    settings: settingsOf(record),
    // Preview with the merchant's first chart, or a sample.
    sample: charts[0]?.chart ?? chartFromTemplate(getTemplate("womens-tops")!),
    links: themeEditorLinks(shop, process.env.SHOPIFY_API_KEY || ""),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shop } = await adminContext(request);
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return { ok: false as const, message: "Some settings aren't valid. Check the colour is a hex value like #1a1a1a." };
  // Paid options are stored even on Free (so nothing is lost on downgrade); publishing applies the plan.
  await saveSettings(shop, parsed.data);
  try {
    await publish(shop, admin);
    return { ok: true as const, settings: parsed.data, message: "Appearance saved" };
  } catch (error) {
    return { ok: true as const, settings: parsed.data, message: `Saved, but your store wasn't updated: ${error instanceof Error ? error.message : "unknown error"}` };
  }
};

export default function Appearance() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [settings, setSettings] = useState<AppearanceSettings>(data.settings);
  const [saved, setSaved] = useState(() => JSON.stringify(data.settings));
  const dirty = JSON.stringify(settings) !== saved;
  const saving = fetcher.state !== "idle";
  const styleAllowed = hasFeature(data.plan, "customStyle");
  const locked = lockedSettingsInUse(settings, data.plan);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    shopify.toast.show(fetcher.data.message, { isError: !fetcher.data.ok });
    if (fetcher.data.ok) setSaved(JSON.stringify(fetcher.data.settings));
  }, [fetcher.state, fetcher.data, shopify]);

  const set = (patch: Partial<AppearanceSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const save = () => fetcher.submit(settings as never, { method: "post", encType: "application/json" });

  return (
    <s-page heading="Appearance">
      <s-link slot="breadcrumb-actions" href="/app">
        Home
      </s-link>

      <SaveBar id="settings-save-bar" open={dirty} discardConfirmation>
        <button variant="primary" onClick={save} loading={saving ? "" : undefined} disabled={saving}>
          Save
        </button>
        <button onClick={() => setSettings(JSON.parse(saved) as AppearanceSettings)} disabled={saving}>
          Discard
        </button>
      </SaveBar>

      {locked.length > 0 && (
        <UpgradeCallout feature="customStyle">
          <s-paragraph>You picked options from the Pro plan. They show in the preview, and go live on your store when you upgrade.</s-paragraph>
        </UpgradeCallout>
      )}

      <s-section heading="Button">
        <s-stack gap="base">
          <s-text-field
            label="Button text"
            details="Leave empty to show “Size chart” in each shopper's language."
            placeholder="Size chart"
            value={settings.buttonLabel}
            maxLength={40}
            onInput={(e) => set({ buttonLabel: valueOf(e) })}
          />
          <s-choice-list label="Style" values={[settings.buttonStyle]} onChange={(e) => set({ buttonStyle: (valuesOf(e)[0] ?? "link") as AppearanceSettings["buttonStyle"] })}>
            <s-choice value="link">Text link</s-choice>
            <s-choice value="outline">Outlined button</s-choice>
            <s-choice value="filled">Filled button</s-choice>
          </s-choice-list>
          <s-choice-list label="Alignment" values={[settings.alignment]} onChange={(e) => set({ alignment: (valuesOf(e)[0] ?? "start") as AppearanceSettings["alignment"] })}>
            <s-choice value="start">Left</s-choice>
            <s-choice value="center">Centre</s-choice>
            <s-choice value="end">Right</s-choice>
          </s-choice-list>
          <s-stack gap="small-200">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-text type="strong">Icon and colour</s-text>
              <FeatureBadge feature="customStyle" plan={data.plan} />
            </s-stack>
            <s-select label="Icon" value={settings.icon} onChange={(e) => set({ icon: valueOf(e) as AppearanceSettings["icon"] })}>
              <s-option value="ruler">Ruler</s-option>
              <s-option value="tape">Measuring tape</s-option>
              <s-option value="hanger">Hanger</s-option>
              <s-option value="none">No icon</s-option>
            </s-select>
            <s-color-field
              label="Button colour"
              details="Leave empty to use your theme's text colour."
              placeholder="#1a1a1a"
              value={settings.accentColor}
              onChange={(e) => set({ accentColor: valueOf(e) })}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <s-section heading="Chart window">
        <s-stack gap="base">
          <s-stack gap="small-200">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-text type="strong">Layout</s-text>
              <FeatureBadge feature="customStyle" plan={data.plan} />
            </s-stack>
            <s-choice-list label="Layout" labelAccessibilityVisibility="exclusive" values={[settings.layout]} onChange={(e) => set({ layout: valuesOf(e)[0] === "drawer" ? "drawer" : "modal" })}>
              <s-choice value="modal">Pop-up in the middle of the page (a sheet from the bottom on phones)</s-choice>
              <s-choice value="drawer">Drawer from the side</s-choice>
            </s-choice-list>
          </s-stack>
          <s-select label="Unit shown first" value={settings.defaultUnit} onChange={(e) => set({ defaultUnit: valueOf(e) as AppearanceSettings["defaultUnit"] })}>
            <s-option value="auto">Automatic: inches in the US, centimetres elsewhere</s-option>
            <s-option value="cm">Always centimetres</s-option>
            <s-option value="in">Always inches</s-option>
          </s-select>
          <s-text color="subdued">Shoppers can always switch, and their choice is remembered.</s-text>
        </s-stack>
      </s-section>

      <s-section heading="Placement">
        <s-stack gap="base">
          <s-select
            label="Where the button appears"
            details="Used by the Sizemate app embed. For exact placement, add the “Size chart” block to your product page in the theme editor instead."
            value={settings.autoPlacement}
            onChange={(e) => set({ autoPlacement: valueOf(e) as AppearanceSettings["autoPlacement"] })}
          >
            <s-option value="before_buy_buttons">Above the Add to cart button</s-option>
            <s-option value="after_variant_picker">Below the size selector</s-option>
            <s-option value="after_price">Below the price</s-option>
            <s-option value="off">Only where I place the block</s-option>
          </s-select>
          <s-stack direction="inline" gap="base">
            <s-button href={data.links.activateEmbed} target="_top">
              Turn on app embed
            </s-button>
            <s-button variant="tertiary" href={data.links.addBlock} target="_top">
              Add block to product page
            </s-button>
          </s-stack>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Preview">
        <ChartPreview
          chart={data.sample}
          settings={{ ...settings, defaultUnit: settings.defaultUnit }}
          fitFinder={hasFeature(data.plan, "fitFinder")}
          branding={!hasFeature(data.plan, "removeBranding")}
        />
        {!styleAllowed && locked.length > 0 && (
          <s-box paddingBlockStart="base">
            <s-text color="subdued">
              Your store currently uses the default style: {JSON.stringify(effectiveSettings(settings, data.plan)) === JSON.stringify(settings) ? "" : "Pro options are shown here as a preview."}
            </s-text>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
