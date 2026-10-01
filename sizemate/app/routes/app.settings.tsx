import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";

import { ChartPreview, PreviewStage, type StageScheme } from "../components/ChartPreview";
import { PresetPicker } from "../components/PresetPicker";
import { checkedOf, Choices, FeatureBadge, proLabel, Segmented, Select, UpgradeCallout, valueOf } from "../components/ui";
import { hasFeature } from "../lib/plans";
import {
  applyPreset,
  FONT_CHOICES,
  isProChoice,
  lockedSettingsInUse,
  settingsSchema,
  type AppearanceSettings,
  type FontChoice,
} from "../lib/settings";
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

const FONT_LABELS: Record<FontChoice, string> = {
  theme: "Theme body font",
  heading: "Theme heading font",
  system: "System sans-serif",
  serif: "Classic serif",
  rounded: "Rounded",
  geometric: "Geometric",
  humanist: "Humanist",
  mono: "Monospace",
};

const COLOURS = [
  { key: "accentColor", label: "Accent", details: "Buttons, highlights and the recommended size. Empty: your theme's button colour." },
  { key: "backgroundColor", label: "Background", details: "Empty: your theme's background." },
  { key: "textColor", label: "Text", details: "Empty: your theme's text colour." },
  { key: "headerBackground", label: "Table header background", details: "Empty: a tint of the text colour." },
  { key: "headerTextColor", label: "Table header text", details: "Empty: the text colour." },
  { key: "borderColor", label: "Lines", details: "Empty: a soft tint of the text colour." },
] as const;

const TEXT_SCALES = [90, 100, 110, 115, 125, 140] as const;

export default function Appearance() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [settings, setSettings] = useState<AppearanceSettings>(data.settings);
  const [saved, setSaved] = useState(() => JSON.stringify(data.settings));
  const [scheme, setScheme] = useState<StageScheme>("light");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [advanced, setAdvanced] = useState(false);
  const dirty = JSON.stringify(settings) !== saved;
  const saving = fetcher.state !== "idle";
  const studio = hasFeature(data.plan, "customStyle");
  const locked = lockedSettingsInUse(settings, data.plan);
  const pro = <K extends keyof AppearanceSettings>(key: K, value?: AppearanceSettings[K]) => !studio && isProChoice(key, value);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    shopify.toast.show(fetcher.data.message, { isError: !fetcher.data.ok });
    if (fetcher.data.ok) setSaved(JSON.stringify(fetcher.data.settings));
  }, [fetcher.state, fetcher.data, shopify]);

  const set = (patch: Partial<AppearanceSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const save = () => fetcher.submit(settings as never, { method: "post", encType: "application/json" });
  const options = <K extends keyof AppearanceSettings>(key: K, list: readonly { value: AppearanceSettings[K] & string; label: string }[]) =>
    list.map((option) => ({ ...option, label: proLabel(option.label, pro(key, option.value)) }));

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
          <s-paragraph>
            You&apos;re trying options from the design studio. They show in the preview and go live on your store when you upgrade to Pro.
          </s-paragraph>
        </UpgradeCallout>
      )}

      <s-section heading="Preview">
        <s-stack gap="base">
          <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
            <s-text color="subdued">The chart reads your theme&apos;s fonts and colours. Try it on a light and a dark store.</s-text>
            <s-stack direction="inline" gap="small-200">
              <Segmented label="Store theme" value={scheme} options={[{ value: "light", label: "Light store" }, { value: "dark", label: "Dark store" }]} onChange={setScheme} />
              <Segmented label="Device" value={device} options={[{ value: "desktop", label: "Desktop" }, { value: "phone", label: "Phone" }]} onChange={setDevice} />
            </s-stack>
          </s-stack>
          <PreviewStage scheme={scheme} compact={device === "phone"}>
            <ChartPreview chart={data.sample} settings={settings} plan={data.plan} trySettings />
          </PreviewStage>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Style">
        <s-stack gap="base">
          <PresetPicker value={settings.preset} locked={!studio} onChange={(id) => setSettings((current) => applyPreset(current, id))} />
          <s-text color="subdued">“Match my theme” uses your store&apos;s own fonts, colours and corners. You can fine-tune any style below.</s-text>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Button">
        <s-stack gap="base">
          <s-text-field
            label="Button text"
            details="Leave empty to show “Size chart” in each shopper's language."
            placeholder="Size chart"
            value={settings.buttonLabel}
            maxLength={40}
            onInput={(e) => set({ buttonLabel: valueOf(e) })}
          />
          <Select
            label="Style"
            value={settings.buttonStyle}
            options={options("buttonStyle", [
              { value: "link", label: "Text link" },
              { value: "outline", label: "Outlined button" },
              { value: "filled", label: "Filled button" },
              { value: "pill", label: "Soft pill" },
            ])}
            onChange={(buttonStyle) => set({ buttonStyle })}
          />
          <Select
            label="Alignment"
            value={settings.alignment}
            options={[
              { value: "start", label: "Left" },
              { value: "center", label: "Centre" },
              { value: "end", label: "Right" },
            ]}
            onChange={(alignment) => set({ alignment })}
          />
          <Select
            label={proLabel("Icon", pro("icon"))}
            value={settings.icon}
            options={[
              { value: "ruler", label: "Ruler" },
              { value: "tape", label: "Measuring tape" },
              { value: "hanger", label: "Hanger" },
              { value: "shirt", label: "T-shirt" },
              { value: "none", label: "No icon" },
            ]}
            onChange={(icon) => set({ icon })}
          />
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Window">
        <s-stack gap="base">
          <Choices
            label="Opens as"
            value={settings.container}
            options={options("container", [
              { value: "modal", label: "Pop-up (a sheet from the bottom on phones)" },
              { value: "drawer", label: "Drawer from the side" },
              { value: "inline", label: "Opens in place on the page" },
            ])}
            onChange={(container) => set({ container })}
          />
          <Choices
            label="Layout"
            value={settings.arrangement}
            options={options("arrangement", [
              { value: "tabs", label: "Tabs: chart, how to measure, find my size" },
              { value: "stacked", label: "One page: everything in a single scroll" },
              { value: "split", label: "Picture card beside the chart" },
            ])}
            onChange={(arrangement) => set({ arrangement })}
          />
          <s-text color="subdued">The picture card shows the chart&apos;s photo, or the measuring illustration when there&apos;s no photo.</s-text>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Readability">
        <s-stack gap="base">
          <Select
            label="Text size"
            details="Relative to your theme's text. Shoppers can make it larger too."
            value={String(settings.textScale) as `${number}`}
            options={TEXT_SCALES.map((scale) => ({ value: String(scale) as `${number}`, label: scale === 100 ? "Same as my theme" : `${scale}%` }))}
            onChange={(value) => set({ textScale: Number(value) })}
          />
          <Select
            label="Light or dark"
            value={settings.colorMode}
            options={[
              { value: "theme", label: "Follow my theme" },
              { value: "system", label: "Follow the shopper's device" },
              { value: "light", label: "Always light" },
              { value: "dark", label: "Always dark" },
            ]}
            onChange={(colorMode) => set({ colorMode })}
          />
          <s-checkbox
            label="Show a “larger text” button"
            details="Lets shoppers enlarge the chart. Their choice is remembered."
            checked={settings.textSizeToggle}
            onChange={(e) => set({ textSizeToggle: checkedOf(e) })}
          />
          <Select
            label="Units shown first"
            details="Shoppers can always switch, and their choice is remembered."
            value={settings.defaultUnit}
            options={[
              { value: "auto", label: "Automatic: imperial in the US, metric elsewhere" },
              { value: "metric", label: "Metric (cm, kg)" },
              { value: "imperial", label: "Imperial (in, lb)" },
            ]}
            onChange={(defaultUnit) => set({ defaultUnit })}
          />
          <s-text color="subdued">
            Always on: keyboard navigation, screen reader labels, reduced motion and high-contrast support.
          </s-text>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Design studio">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-text>Colours, fonts and table details.</s-text>
            <FeatureBadge feature="customStyle" plan={data.plan} />
          </s-stack>
          <s-button variant="secondary" onClick={() => setAdvanced((open) => !open)} aria-expanded={advanced}>
            {advanced ? "Hide design options" : "Show design options"}
          </s-button>
          {advanced && (
            <s-stack gap="base">
              <s-heading>Colours</s-heading>
              {COLOURS.map((colour) => (
                <s-color-field
                  key={colour.key}
                  label={colour.label}
                  details={colour.details}
                  placeholder="From theme"
                  value={settings[colour.key]}
                  onChange={(e) => set({ [colour.key]: valueOf(e) } as Partial<AppearanceSettings>)}
                />
              ))}
              <s-button
                variant="tertiary"
                onClick={() => set(Object.fromEntries(COLOURS.map((colour) => [colour.key, ""])) as Partial<AppearanceSettings>)}
              >
                Use theme colours
              </s-button>

              <s-heading>Typography</s-heading>
              <Select label="Text font" value={settings.font} options={FONT_CHOICES.map((value) => ({ value, label: FONT_LABELS[value] }))} onChange={(font) => set({ font })} />
              <Select
                label="Title font"
                value={settings.headingFont}
                options={FONT_CHOICES.map((value) => ({ value, label: FONT_LABELS[value] }))}
                onChange={(headingFont) => set({ headingFont })}
              />
              <Select
                label="Titles and table headers"
                value={settings.headingCase}
                options={[
                  { value: "normal", label: "As written" },
                  { value: "uppercase", label: "Small capitals" },
                ]}
                onChange={(headingCase) => set({ headingCase })}
              />

              <s-heading>Table</s-heading>
              <Select
                label="Rows"
                value={settings.tableStyle}
                options={[
                  { value: "lines", label: "Lines between rows" },
                  { value: "striped", label: "Striped rows" },
                  { value: "grid", label: "Full grid" },
                  { value: "minimal", label: "Minimal" },
                ]}
                onChange={(tableStyle) => set({ tableStyle })}
              />
              <Select
                label="Header"
                value={settings.headerStyle}
                options={[
                  { value: "tinted", label: "Tinted" },
                  { value: "solid", label: "Solid accent colour" },
                  { value: "plain", label: "Plain with a strong line" },
                ]}
                onChange={(headerStyle) => set({ headerStyle })}
              />
              <Select
                label="Spacing"
                value={settings.density}
                options={[
                  { value: "compact", label: "Compact" },
                  { value: "regular", label: "Regular" },
                  { value: "relaxed", label: "Relaxed" },
                ]}
                onChange={(density) => set({ density })}
              />
              <Select
                label="Corners"
                value={settings.radius}
                options={[
                  { value: "theme", label: "Like my theme's buttons" },
                  { value: "none", label: "Square" },
                  { value: "small", label: "Slightly rounded" },
                  { value: "medium", label: "Rounded" },
                  { value: "large", label: "Very rounded" },
                ]}
                onChange={(radius) => set({ radius })}
              />
              <Select
                label="Window width"
                value={settings.width}
                options={[
                  { value: "narrow", label: "Narrow" },
                  { value: "regular", label: "Regular" },
                  { value: "wide", label: "Wide" },
                ]}
                onChange={(width) => set({ width })}
              />
              <Select
                label="Drawer side"
                value={settings.drawerSide}
                options={[
                  { value: "right", label: "Right" },
                  { value: "left", label: "Left" },
                ]}
                onChange={(drawerSide) => set({ drawerSide })}
              />
              <s-checkbox
                label="Keep the size column visible when scrolling"
                checked={settings.stickyColumn}
                onChange={(e) => set({ stickyColumn: checkedOf(e) })}
              />
              <s-checkbox
                label="Highlight the row and column under the pointer"
                checked={settings.crosshair}
                onChange={(e) => set({ crosshair: checkedOf(e) })}
              />
            </s-stack>
          )}
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Placement">
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
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
