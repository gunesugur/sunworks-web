import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";

import { ChartPreview } from "../components/ChartPreview";
import { Choices, FeatureBadge, Select, UpgradeCallout, valueOf } from "../components/ui";
import { hasFeature } from "../lib/plans";
import { lockedSettingsInUse, settingsSchema, type AppearanceSettings } from "../lib/settings";
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
    <s-page heading="Appearance" inlineSize="large">
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
          <Choices
            label="Style"
            value={settings.buttonStyle}
            options={[
              { value: "link", label: "Text link" },
              { value: "outline", label: "Outlined button" },
              { value: "filled", label: "Filled button" },
            ]}
            onChange={(buttonStyle) => set({ buttonStyle })}
          />
          <Choices
            label="Alignment"
            value={settings.alignment}
            options={[
              { value: "start", label: "Left" },
              { value: "center", label: "Centre" },
              { value: "end", label: "Right" },
            ]}
            onChange={(alignment) => set({ alignment })}
          />
          <s-stack gap="small-200">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-text type="strong">Icon and colour</s-text>
              <FeatureBadge feature="customStyle" plan={data.plan} />
            </s-stack>
            <Select
              label="Icon"
              value={settings.icon}
              options={[
                { value: "ruler", label: "Ruler" },
                { value: "tape", label: "Measuring tape" },
                { value: "hanger", label: "Hanger" },
                { value: "none", label: "No icon" },
              ]}
              onChange={(icon) => set({ icon })}
            />
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
            <Choices
              label="Layout"
              hideLabel
              value={settings.layout}
              options={[
                { value: "modal", label: "Pop-up in the middle of the page (a sheet from the bottom on phones)" },
                { value: "drawer", label: "Drawer from the side" },
              ]}
              onChange={(layout) => set({ layout })}
            />
          </s-stack>
          <Select
            label="Unit shown first"
            value={settings.defaultUnit}
            options={[
              { value: "auto", label: "Automatic: inches in the US, centimetres elsewhere" },
              { value: "cm", label: "Always centimetres" },
              { value: "in", label: "Always inches" },
            ]}
            onChange={(defaultUnit) => set({ defaultUnit })}
          />
          <s-text color="subdued">Shoppers can always switch, and their choice is remembered.</s-text>
        </s-stack>
      </s-section>

      <s-section heading="Placement">
        <s-stack gap="base">
          <Select
            label="Where the button appears"
            details="Used by the Sizemate app embed. For exact placement, add the “Size chart” block to your product page in the theme editor instead."
            value={settings.autoPlacement}
            options={[
              { value: "before_buy_buttons", label: "Above the Add to cart button" },
              { value: "after_variant_picker", label: "Below the size selector" },
              { value: "after_price", label: "Below the price" },
              { value: "off", label: "Only where I place the block" },
            ]}
            onChange={(autoPlacement) => set({ autoPlacement })}
          />
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
        <s-stack gap="base">
          <ChartPreview
            chart={data.sample}
            settings={settings}
            fitFinder={hasFeature(data.plan, "fitFinder")}
            branding={!hasFeature(data.plan, "removeBranding")}
          />
          {!styleAllowed && locked.length > 0 && (
            <s-text color="subdued">Pro options are shown here as a preview. Your store keeps the default style until you upgrade.</s-text>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
