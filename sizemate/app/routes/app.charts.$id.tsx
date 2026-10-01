import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useBlocker, useFetcher, useLoaderData, useSearchParams } from "react-router";

import { AssignmentEditor } from "../components/AssignmentEditor";
import { ChartPreview, PreviewStage } from "../components/ChartPreview";
import { TableEditor } from "../components/TableEditor";
import { TranslationsEditor } from "../components/TranslationsEditor";
import { checkedOf, FeatureBadge, Select, UpgradeCallout, valueOf } from "../components/ui";
import { useHistory } from "../components/useHistory";
import { type GuideDiagram, type SizeChart } from "../lib/chart";
import { chartToCsv, importCsv } from "../lib/csv";
import { changeUnit, changeWeightUnit, hasWeightColumns } from "../lib/editor";
import { chooseFigure, type FigureId } from "../lib/figures";
import { fitColumns } from "../lib/fit";
import { getMeasure } from "../lib/measures";
import { chartCount, hasFeature, PLANS } from "../lib/plans";
import { buildPublication } from "../lib/publish";
import { effectiveSettings } from "../lib/settings";
import type { LengthUnit, WeightUnit } from "../lib/units";
import { getCatalog } from "../models/catalog.server";
import { deleteChart, duplicate, getChart, listCharts, PlanLimitError, saveChart, ValidationError } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { UploadError, uploadImage } from "../models/files.server";
import { publish } from "../models/publisher.server";
import { getShop, settingsOf } from "../models/shop.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, shop, plan } = await adminContext(request);
  const stored = await getChart(shop, params.id ?? "");
  if (!stored) throw new Response("Size chart not found", { status: 404 });
  const [record, all, catalog] = await Promise.all([getShop(shop), listCharts(shop), getCatalog(admin)]);
  const settings = settingsOf(record);
  const publication = buildPublication(
    all.map((s) => s.chart),
    settings,
    plan,
  );
  return {
    chart: stored.chart,
    plan,
    paused: publication.paused.includes(stored.chart.id),
    settings: effectiveSettings(settings, plan),
    suggestions: { productTypes: catalog.productTypes, vendors: catalog.vendors, tags: catalog.tags },
    languages: catalog.locales
      .filter((l) => !l.primary && l.published)
      .map((l) => ({ locale: l.locale.toLowerCase(), name: l.name })),
  };
};

type ActionResult =
  | { ok: true; intent: "save"; chart: SizeChart; message: string; warning?: string }
  | {
      ok: true;
      intent: "import";
      columns: SizeChart["columns"];
      rows: SizeChart["rows"];
      unit: LengthUnit | null;
      weightUnit: WeightUnit | null;
      warnings: string[];
    }
  | { ok: true; intent: "upload"; image: { url: string; alt: string } }
  | { ok: false; errors: string[] };

export const action = async ({ request, params }: ActionFunctionArgs): Promise<ActionResult | Response> => {
  const { admin, shop, plan, redirect } = await adminContext(request);
  const id = params.id ?? "";

  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    // Photo upload for the picture card.
    if (!hasFeature(plan, "chartImage")) return { ok: false, errors: ["The photo card is on the Pro plan."] };
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) return { ok: false, errors: ["Choose an image to upload."] };
    try {
      const image = await uploadImage(admin, file, String(form.get("alt") ?? "").slice(0, 200));
      return { ok: true, intent: "upload", image };
    } catch (error) {
      if (error instanceof UploadError) return { ok: false, errors: [error.message] };
      const reason = error instanceof Error ? error.message : "unknown error";
      return { ok: false, errors: [`The image couldn't be uploaded: ${reason}`] };
    }
  }

  const body = (await request.json()) as { intent?: string; chart?: unknown; csv?: string };

  switch (body.intent) {
    case "save": {
      if (!(await getChart(shop, id))) return { ok: false, errors: ["This size chart no longer exists."] };
      let chart: SizeChart;
      try {
        chart = await saveChart(shop, { ...(body.chart as object), id }, plan);
      } catch (error) {
        if (error instanceof ValidationError) return { ok: false, errors: error.errors };
        throw error;
      }
      try {
        await publish(shop, admin);
        return { ok: true, intent: "save", chart, message: "Size chart saved" };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        return { ok: true, intent: "save", chart, message: "Saved", warning: `Your store wasn't updated: ${reason}` };
      }
    }
    case "import": {
      if (!hasFeature(plan, "csv")) return { ok: false, errors: ["CSV import is on the Pro plan."] };
      const imported = importCsv(String(body.csv ?? ""));
      if (!imported.ok) return { ok: false, errors: [imported.error] };
      return {
        ok: true,
        intent: "import",
        columns: imported.columns,
        rows: imported.rows,
        unit: imported.unit,
        weightUnit: imported.weightUnit,
        warnings: imported.warnings,
      };
    }
    case "duplicate": {
      try {
        const copy = await duplicate(shop, id, plan);
        if (!copy) return { ok: false, errors: ["Size chart not found."] };
        await publish(shop, admin).catch(() => undefined);
        return redirect(`/app/charts/${copy.id}?created=1`);
      } catch (error) {
        if (error instanceof PlanLimitError) return { ok: false, errors: [error.message] };
        throw error;
      }
    }
    case "delete": {
      await deleteChart(shop, id);
      await publish(shop, admin).catch(() => undefined);
      return redirect("/app/charts");
    }
    default:
      return { ok: false, errors: ["Unknown action"] };
  }
};

const FIGURE_LABELS: Record<FigureId, string> = {
  "body-f": "Body",
  "body-m": "Body",
  foot: "Foot",
  hand: "Hand and wrist",
  head: "Head",
  garment: "Top laid flat",
  pants: "Trousers laid flat",
  pet: "Pet",
  ring: "Ring",
};

const PICTURES: { value: GuideDiagram; label: string }[] = [
  { value: "torso", label: "Body" },
  { value: "foot", label: "Foot" },
  { value: "hand", label: "Hand and wrist" },
  { value: "head", label: "Head" },
  { value: "garment", label: "Top laid flat" },
  { value: "pants", label: "Trousers laid flat" },
  { value: "ring", label: "Ring" },
  { value: "pet", label: "Pet" },
  { value: "none", label: "No picture" },
];

const FIT_SCALE = [
  { value: "", label: "Don't show" },
  { value: "-2", label: "Runs small: size up" },
  { value: "-1", label: "Runs slightly small" },
  { value: "0", label: "True to size" },
  { value: "1", label: "Runs slightly large" },
  { value: "2", label: "Runs large: size down" },
] as const;

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ChartEditor() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResult>();
  const shopify = useAppBridge();
  const [searchParams, setSearchParams] = useSearchParams();
  const history = useHistory<SizeChart>(data.chart);
  const chart = history.value;
  const setChart = history.set;
  const [saved, setSaved] = useState(() => JSON.stringify(data.chart));
  const [convertOnSwitch, setConvertOnSwitch] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(searchParams.get("notice"));
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(chart) !== saved;
  const pending = (fetcher.json as { intent?: string } | undefined)?.intent;
  const saving = fetcher.state !== "idle" && pending === "save";
  const uploading = fetcher.state !== "idle" && fetcher.formData !== undefined;
  const plan = PLANS[data.plan];
  const fitAllowed = hasFeature(data.plan, "fitFinder");
  const csvAllowed = hasFeature(data.plan, "csv");
  const translationsAllowed = hasFeature(data.plan, "translations");
  const imageAllowed = hasFeature(data.plan, "chartImage");
  const fitScaleAllowed = hasFeature(data.plan, "fitScale");
  const fitFields = useMemo(() => fitColumns(chart), [chart]);
  const weights = hasWeightColumns(chart);
  const { reset } = history;

  // A new loader result (e.g. after duplicate navigates here) resets the form.
  useEffect(() => {
    reset(data.chart);
    setSaved(JSON.stringify(data.chart));
  }, [data.chart, reset]);

  useEffect(() => {
    if (searchParams.get("created")) {
      shopify.toast.show("Size chart created");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, shopify]);

  useEffect(() => {
    const result = fetcher.data;
    if (fetcher.state !== "idle" || !result) return;
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    if (result.intent === "save") {
      setChart(result.chart);
      setSaved(JSON.stringify(result.chart));
      shopify.toast.show(result.message);
      if (result.warning) setErrors([result.warning]);
    } else if (result.intent === "import") {
      setChart((current) => ({
        ...current,
        columns: result.columns,
        rows: result.rows,
        unit: result.unit ?? current.unit,
        weightUnit: result.weightUnit ?? current.weightUnit,
      }));
      setNotice(result.warnings.length ? result.warnings.join(" ") : null);
      shopify.toast.show("Table imported. Review it, then save.");
    } else if (result.intent === "upload") {
      setChart((current) => ({ ...current, image: result.image }));
      shopify.toast.show("Photo uploaded");
    }
  }, [fetcher.state, fetcher.data, shopify, setChart]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    // Stay on the page and let the save bar ask the merchant to save or discard.
    if (blocker.state !== "blocked") return;
    void shopify.saveBar.leaveConfirmation();
    blocker.reset();
  }, [blocker, shopify]);

  const update = (patch: Partial<SizeChart>) => setChart((current) => ({ ...current, ...patch }));
  const save = () => fetcher.submit({ intent: "save", chart } as never, { method: "post", encType: "application/json" });
  const discard = () => {
    setChart(JSON.parse(saved) as SizeChart);
    setErrors([]);
  };
  const submit = (intent: string) => fetcher.submit({ intent } as never, { method: "post", encType: "application/json" });

  /** Table edits; removing a row or column offers an undo right in the toast. */
  const onTableChange = (next: SizeChart) => {
    const removedRow = next.rows.length < chart.rows.length;
    const removedColumn = next.columns.length < chart.columns.length;
    setChart(next);
    if (removedRow || removedColumn) {
      shopify.toast.show(removedColumn ? "Column deleted" : "Row deleted", { action: "Undo", onAction: history.undo });
    }
  };

  const onCsvFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) fetcher.submit({ intent: "import", csv: await file.text() } as never, { method: "post", encType: "application/json" });
  };

  const onImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    form.append("alt", chart.title || chart.name);
    fetcher.submit(form, { method: "post", encType: "multipart/form-data" });
  };

  const measures = chart.columns.flatMap((c) => (c.kind === "measure" && c.measure ? [c.measure] : []));
  const measuresInGuide = chart.columns.filter((c) => c.kind === "measure" && c.measure && c.measure !== "other");
  const autoFigure = chooseFigure(measures, chart.category);

  return (
    <s-page heading={chart.name || "Size chart"} inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app/charts">
        Size charts
      </s-link>
      <s-button slot="secondary-actions" icon="undo" disabled={!history.canUndo} onClick={history.undo} accessibilityLabel="Undo (Ctrl+Z)">
        Undo
      </s-button>
      <s-button slot="secondary-actions" icon="redo" disabled={!history.canRedo} onClick={history.redo} accessibilityLabel="Redo (Ctrl+Shift+Z)">
        Redo
      </s-button>
      <s-button slot="secondary-actions" icon="duplicate" onClick={() => submit("duplicate")}>
        Duplicate
      </s-button>
      <s-button slot="secondary-actions" icon="delete" tone="critical" commandFor="delete-chart" command="--show">
        Delete
      </s-button>

      <SaveBar id="chart-save-bar" open={dirty} discardConfirmation>
        <button variant="primary" onClick={save} loading={saving ? "" : undefined} disabled={saving}>
          Save
        </button>
        <button onClick={discard} disabled={saving}>
          Discard
        </button>
      </SaveBar>

      {errors.length > 0 && (
        <s-banner tone="critical" heading={errors.length === 1 ? "There's a problem with this chart" : `There are ${errors.length} problems with this chart`}>
          <s-unordered-list>
            {errors.map((error) => (
              <s-list-item key={error}>{error}</s-list-item>
            ))}
          </s-unordered-list>
        </s-banner>
      )}

      {notice && (
        <s-banner tone="warning" dismissible onDismiss={() => setNotice(null)}>
          <s-paragraph>{notice}</s-paragraph>
        </s-banner>
      )}

      {data.paused && chart.status === "active" && (
        <s-banner tone="warning" heading="This chart is paused">
          <s-paragraph>
            The {plan.name} plan shows {chartCount(plan.chartLimit)} on your store, and other charts are higher in your list. Upgrade, or move
            this chart to the top of the list.
          </s-paragraph>
          <s-button slot="secondary-actions" href="/app/plans">
            See plans
          </s-button>
        </s-banner>
      )}

      <s-section heading="Details">
        <s-stack gap="base">
          <s-text-field label="Name" details="Only you see this." value={chart.name} onInput={(e) => update({ name: valueOf(e) })} required />
          <s-text-field
            label="Title"
            details="The heading shoppers see above the chart."
            value={chart.title}
            placeholder="Size chart"
            onInput={(e) => update({ title: valueOf(e) })}
          />
        </s-stack>
      </s-section>

      <s-section heading="Size table">
        <s-button slot="secondary-actions" icon="import" disabled={!csvAllowed} onClick={() => fileInput.current?.click()}>
          Import CSV
        </s-button>
        <s-button
          slot="secondary-actions"
          icon="export"
          disabled={!csvAllowed}
          onClick={() => download(`${chart.name || "size-chart"}.csv`, chartToCsv(chart))}
        >
          Export CSV
        </s-button>
        <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={onCsvFile} aria-label="CSV file" />
        <s-stack gap="base">
          {!csvAllowed && (
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <FeatureBadge feature="csv" plan={data.plan} />
              <s-text color="subdued">CSV import and export are on the Pro plan. Pasting from a spreadsheet works on every plan.</s-text>
            </s-stack>
          )}
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="base" alignItems="end">
            <Select
              label="Lengths are in"
              value={chart.unit}
              options={[
                { value: "cm", label: "Centimetres (cm)" },
                { value: "mm", label: "Millimetres (mm)" },
                { value: "in", label: "Inches (in)" },
              ]}
              onChange={(unit) => setChart((current) => changeUnit(current, unit, convertOnSwitch))}
            />
            {weights && (
              <Select
                label="Weights are in"
                value={chart.weightUnit}
                options={[
                  { value: "kg", label: "Kilograms (kg)" },
                  { value: "lb", label: "Pounds (lb)" },
                ]}
                onChange={(weightUnit) => setChart((current) => changeWeightUnit(current, weightUnit, convertOnSwitch))}
              />
            )}
            <s-checkbox label="Convert the numbers when I switch" checked={convertOnSwitch} onChange={(e) => setConvertOnSwitch(checkedOf(e))} />
          </s-grid>
          <TableEditor chart={chart} onChange={onTableChange} />
          <s-paragraph color="subdued">
            Shoppers switch between metric and imperial, and see numbers converted for them: heights in feet and inches, weights in kg or lb.
            Undo any change with Ctrl+Z (⌘Z on a Mac).
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="Note and fit">
        <s-stack gap="base">
          <s-text-area
            label="Note under the table"
            rows={2}
            value={chart.note}
            placeholder="e.g. Between sizes? Choose the larger size for a relaxed fit."
            onInput={(e) => update({ note: valueOf(e) })}
          />
          <s-stack gap="small-200">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-text type="strong">Fit scale</s-text>
              <FeatureBadge feature="fitScale" plan={data.plan} />
            </s-stack>
            <Select
              label="How does this product fit?"
              details="Shows a “runs small … runs large” scale above the chart, so shoppers know whether to size up or down."
              value={chart.fitScale === null ? "" : String(chart.fitScale)}
              options={FIT_SCALE.map((option) => ({ ...option }))}
              onChange={(value) => update({ fitScale: value === "" ? null : Number(value) })}
            />
            {!fitScaleAllowed && chart.fitScale !== null && <s-text color="subdued">Saved with the chart. It shows on your store with Pro.</s-text>}
          </s-stack>
        </s-stack>
      </s-section>

      <s-section heading="How to measure">
        <s-stack gap="base">
          <s-switch
            label="Show “How to measure”"
            details="A numbered illustration and instructions for each measurement in your table, in the shopper's language."
            checked={chart.guide.enabled}
            onChange={(e) => update({ guide: { ...chart.guide, enabled: checkedOf(e) } })}
          />
          {chart.guide.enabled && (
            <>
              <Select
                label="Illustration"
                value={chart.guide.diagram === "legs" ? "torso" : chart.guide.diagram === "wrist" ? "hand" : chart.guide.diagram}
                options={[
                  { value: "auto" as GuideDiagram, label: `Automatic (${autoFigure ? FIGURE_LABELS[autoFigure].toLowerCase() : "no picture"})` },
                  ...PICTURES,
                ]}
                onChange={(diagram) => update({ guide: { ...chart.guide, diagram } })}
              />
              <s-text-area
                label="Your own tips (optional)"
                rows={3}
                value={chart.guide.text}
                placeholder="e.g. Our jeans are slim fit. If you prefer a looser fit, size up."
                onInput={(e) => update({ guide: { ...chart.guide, text: valueOf(e) } })}
              />
              {measuresInGuide.length > 0 && (
                <s-box padding="base" background="subdued" borderRadius="base">
                  <s-stack gap="small-200">
                    <s-text type="strong">Instructions shoppers will see</s-text>
                    {measuresInGuide.map((c) => (
                      <s-paragraph key={c.id}>
                        <s-text type="strong">{c.label}: </s-text>
                        {getMeasure(c.measure!)?.howTo}
                      </s-paragraph>
                    ))}
                  </s-stack>
                </s-box>
              )}
            </>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Photo card">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-paragraph>
              A model shot or flat lay shown beside the chart when Appearance › Layout is “Picture card beside the chart”.
            </s-paragraph>
            <FeatureBadge feature="chartImage" plan={data.plan} />
          </s-stack>
          {imageAllowed ? (
            <>
              <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onImageFile} aria-label="Photo" />
              {chart.image ? (
                <s-stack gap="base">
                  <s-thumbnail src={chart.image.url} alt={chart.image.alt} size="large" />
                  <s-text-field
                    label="Description for screen readers"
                    value={chart.image.alt}
                    maxLength={200}
                    onInput={(e) => update({ image: chart.image ? { ...chart.image, alt: valueOf(e) } : null })}
                  />
                  <s-stack direction="inline" gap="base">
                    <s-button onClick={() => imageInput.current?.click()} loading={uploading}>
                      Replace photo
                    </s-button>
                    <s-button variant="tertiary" tone="critical" onClick={() => update({ image: null })}>
                      Remove
                    </s-button>
                  </s-stack>
                </s-stack>
              ) : (
                <s-button icon="upload" onClick={() => imageInput.current?.click()} loading={uploading}>
                  Upload photo
                </s-button>
              )}
              <s-text color="subdued">JPG, PNG or WebP up to 10 MB. Saved to Content › Files in your Shopify admin.</s-text>
            </>
          ) : (
            <UpgradeCallout feature="chartImage">
              <s-paragraph>Show shoppers how the product fits on a real person, right next to the numbers.</s-paragraph>
            </UpgradeCallout>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Fit Finder">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-paragraph>
              Shoppers enter their measurements and get a size recommendation from this chart, with one click to select that size.
            </s-paragraph>
            <FeatureBadge feature="fitFinder" plan={data.plan} />
          </s-stack>
          {fitAllowed ? (
            <>
              <s-switch
                label="Offer size recommendations"
                checked={chart.fitFinder}
                disabled={fitFields.length === 0}
                onChange={(e) => update({ fitFinder: checkedOf(e) })}
              />
              {fitFields.length > 0 ? (
                <s-text color="subdued">Shoppers will be asked for: {fitFields.map((c) => c.label).join(", ")}.</s-text>
              ) : (
                <s-text color="subdued">
                  Add a body measurement column (like Chest, Waist or Foot length) with numbers for at least two sizes to use the Fit Finder.
                  Garment measurements taken flat can&apos;t be compared with body measurements.
                </s-text>
              )}
            </>
          ) : (
            <UpgradeCallout feature="fitFinder">
              <s-paragraph>Fewer “wrong size” returns: shoppers get a recommendation from your own chart before they buy.</s-paragraph>
            </UpgradeCallout>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Translations">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-paragraph color="subdued">
              Buttons, tabs and measuring instructions are translated automatically into English, German, French, Spanish, Italian, Dutch,
              Portuguese and Turkish. Translate your own text here.
            </s-paragraph>
            <FeatureBadge feature="translations" plan={data.plan} />
          </s-stack>
          {!translationsAllowed && data.languages.length > 0 && <UpgradeCallout feature="translations" />}
          <TranslationsEditor chart={chart} languages={data.languages} locked={!translationsAllowed} onChange={setChart} />
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Status">
        <Select
          label="Status"
          hideLabel
          value={chart.status}
          options={[
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
          ]}
          onChange={(status) => update({ status })}
        />
        <s-box paddingBlockStart="small-200">
          <s-text color="subdued">{chart.status === "draft" ? "Drafts are hidden from shoppers." : "Shown on your store after you save."}</s-text>
        </s-box>
      </s-section>

      <s-section slot="aside" heading="Show on">
        <AssignmentEditor assignment={chart.assignment} suggestions={data.suggestions} onChange={(assignment) => update({ assignment })} />
      </s-section>

      <s-section slot="aside" heading="Preview">
        <s-stack gap="base">
          <PreviewStage scheme="light" compact>
            <ChartPreview chart={chart} settings={data.settings} plan={data.plan} />
          </PreviewStage>
          <s-link href="/app/settings">Change the design</s-link>
        </s-stack>
      </s-section>

      <s-modal id="delete-chart" heading="Delete size chart?">
        <s-paragraph>“{chart.name}” will be removed from your store right away. This can&apos;t be undone.</s-paragraph>
        <s-button slot="secondary-actions" commandFor="delete-chart" command="--hide">
          Cancel
        </s-button>
        <s-button slot="primary-action" variant="primary" tone="critical" commandFor="delete-chart" command="--hide" onClick={() => submit("delete")}>
          Delete
        </s-button>
      </s-modal>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
