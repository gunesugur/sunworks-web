import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useBlocker, useFetcher, useLoaderData, useSearchParams } from "react-router";

import { AssignmentEditor } from "../components/AssignmentEditor";
import { ChartPreview } from "../components/ChartPreview";
import { TableEditor } from "../components/TableEditor";
import { TranslationsEditor } from "../components/TranslationsEditor";
import { checkedOf, FeatureBadge, Select, UpgradeCallout, valueOf } from "../components/ui";
import { DIAGRAMS, resolveDiagram, type GuideDiagram, type SizeChart } from "../lib/chart";
import { chartToCsv, importCsv } from "../lib/csv";
import { changeUnit } from "../lib/editor";
import { fitColumns } from "../lib/fit";
import { getMeasure } from "../lib/measures";
import { hasFeature, PLANS } from "../lib/plans";
import { buildPublication } from "../lib/publish";
import { effectiveSettings } from "../lib/settings";
import type { Unit } from "../lib/units";
import { getCatalog } from "../models/catalog.server";
import { deleteChart, duplicate, getChart, listCharts, PlanLimitError, saveChart, ValidationError } from "../models/charts.server";
import { adminContext } from "../models/context.server";
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
  | { ok: true; intent: "import"; columns: SizeChart["columns"]; rows: SizeChart["rows"]; unit: Unit | null; warnings: string[] }
  | { ok: false; errors: string[] };

export const action = async ({ request, params }: ActionFunctionArgs): Promise<ActionResult | Response> => {
  const { admin, shop, plan, redirect } = await adminContext(request);
  const body = (await request.json()) as { intent?: string; chart?: unknown; csv?: string };
  const id = params.id ?? "";

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
      return { ok: true, intent: "import", columns: imported.columns, rows: imported.rows, unit: imported.unit, warnings: imported.warnings };
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

const DIAGRAM_LABELS: Record<GuideDiagram, string> = {
  auto: "Automatic",
  torso: "Upper body",
  legs: "Lower body",
  foot: "Foot",
  head: "Head",
  hand: "Hand",
  garment: "Garment laid flat",
  pet: "Pet",
  none: "No picture",
};

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
  const [chart, setChart] = useState<SizeChart>(data.chart);
  const [saved, setSaved] = useState(() => JSON.stringify(data.chart));
  const [convertOnSwitch, setConvertOnSwitch] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(searchParams.get("notice"));
  const fileInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(chart) !== saved;
  const saving = fetcher.state !== "idle" && fetcher.json !== undefined && (fetcher.json as { intent?: string }).intent === "save";
  const plan = PLANS[data.plan];
  const fitAllowed = hasFeature(data.plan, "fitFinder");
  const csvAllowed = hasFeature(data.plan, "csv");
  const translationsAllowed = hasFeature(data.plan, "translations");
  const fitFields = useMemo(() => fitColumns({ unit: chart.unit, columns: chart.columns, rows: chart.rows }), [chart]);

  // A new loader result (e.g. after duplicate navigates here) resets the form.
  useEffect(() => {
    setChart(data.chart);
    setSaved(JSON.stringify(data.chart));
  }, [data.chart]);

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
      setChart((current) => ({ ...current, columns: result.columns, rows: result.rows, unit: result.unit ?? current.unit }));
      setNotice(result.warnings.length ? result.warnings.join(" ") : null);
      shopify.toast.show("Table imported. Review it, then save.");
    }
  }, [fetcher.state, fetcher.data, shopify]);

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

  const onCsvFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) fetcher.submit({ intent: "import", csv: await file.text() } as never, { method: "post", encType: "application/json" });
  };

  const measuresInGuide = chart.columns.filter((c) => c.kind === "measure" && c.measure && c.measure !== "other");
  const autoDiagram = resolveDiagram({ ...chart, guide: { ...chart.guide, diagram: "auto" } });

  return (
    <s-page heading={chart.name || "Size chart"} inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app/charts">
        Size charts
      </s-link>
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
            The {plan.name} plan shows {plan.chartLimit} size chart on your store, and another chart is higher in your list. Upgrade, or move
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
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="base" alignItems="end">
            <Select
              label="Measurements are in"
              value={chart.unit}
              options={[
                { value: "cm", label: "Centimetres (cm)" },
                { value: "in", label: "Inches (in)" },
              ]}
              onChange={(unit) => setChart((current) => changeUnit(current, unit, convertOnSwitch))}
            />
            <s-checkbox
              label="Convert the numbers when I switch"
              checked={convertOnSwitch}
              onChange={(e) => setConvertOnSwitch(checkedOf(e))}
            />
          </s-grid>
          <TableEditor chart={chart} onChange={setChart} />
          <s-paragraph color="subdued">
            Shoppers can switch between cm and inches. Values are converted for them automatically.
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="Note">
        <s-text-area
          label="Note under the table"
          labelAccessibilityVisibility="exclusive"
          rows={2}
          value={chart.note}
          placeholder="e.g. Between sizes? Choose the larger size for a relaxed fit."
          onInput={(e) => update({ note: valueOf(e) })}
        />
      </s-section>

      <s-section heading="How to measure">
        <s-stack gap="base">
          <s-switch
            label="Show a “How to measure” tab"
            details="Includes a picture and instructions for each measurement in your table, in the shopper's language."
            checked={chart.guide.enabled}
            onChange={(e) => update({ guide: { ...chart.guide, enabled: checkedOf(e) } })}
          />
          {chart.guide.enabled && (
            <>
              <Select
                label="Picture"
                value={chart.guide.diagram}
                options={DIAGRAMS.map((d) => ({
                  value: d,
                  label: d === "auto" ? `Automatic (${DIAGRAM_LABELS[autoDiagram].toLowerCase()})` : DIAGRAM_LABELS[d],
                }))}
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
          <ChartPreview chart={chart} settings={data.settings} fitFinder={fitAllowed} branding={!hasFeature(data.plan, "removeBranding")} />
          <s-link href="/app/settings">Change button and colours</s-link>
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
