import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useMemo, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigate } from "react-router";

import { FeatureBadge, valueOf } from "../components/ui";
import { blankChart, type SizeChart } from "../lib/chart";
import { importCsv } from "../lib/csv";
import { chooseFigure, figureSvg } from "../lib/figures";
import { canCreateChart, hasFeature, PLANS } from "../lib/plans";
import { chartFromTemplate, ESSENTIAL_COUNT, getTemplate, templateAllowed, TEMPLATE_GROUPS, TEMPLATES } from "../lib/templates";
import { countCharts, PlanLimitError, saveChart, ValidationError } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { publish } from "../models/publisher.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan } = await adminContext(request);
  const count = await countCharts(shop);
  return {
    plan,
    canCreate: canCreateChart(plan, count),
    csvAllowed: hasFeature(plan, "csv"),
    templates: TEMPLATES.map((t) => {
      const measures = t.columns.flatMap((c) => (c.measure ? [c.measure] : []));
      const figure = chooseFigure(measures, t.key);
      return {
        key: t.key,
        name: t.name,
        group: t.group,
        description: t.description,
        locked: !templateAllowed(plan, t),
        columns: t.columns.map((c) => c.label),
        rows: t.rows.slice(0, 3),
        figure: figure ? figureSvg(figure, []) : null,
      };
    }),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shop, plan, redirect } = await adminContext(request);
  const form = await request.formData();
  let chart: SizeChart;
  const warnings: string[] = [];

  if (form.get("intent") === "csv") {
    if (!hasFeature(plan, "csv")) return { ok: false, message: "CSV import is on the Pro plan." };
    const imported = importCsv(String(form.get("csv") ?? ""));
    if (!imported.ok) return { ok: false, message: imported.error };
    warnings.push(...imported.warnings);
    const name = String(form.get("name") ?? "").replace(/\.csv$/i, "").trim() || "Imported size chart";
    chart = {
      ...blankChart(),
      name: name.slice(0, 80),
      title: "Size chart",
      columns: imported.columns,
      rows: imported.rows,
      unit: imported.unit ?? "cm",
      weightUnit: imported.weightUnit ?? "kg",
    };
  } else {
    const template = getTemplate(String(form.get("template") ?? ""));
    if (!template) return { ok: false, message: "Template not found" };
    if (!templateAllowed(plan, template)) return { ok: false, message: `“${template.name}” is in the Pro template library.` };
    chart = chartFromTemplate(template);
  }

  try {
    await saveChart(shop, chart, plan);
  } catch (error) {
    if (error instanceof PlanLimitError || error instanceof ValidationError) return { ok: false, message: error.message };
    throw error;
  }
  await publish(shop, admin).catch((error: unknown) => console.error("Publish after create failed", error));
  const query = warnings.length ? `?notice=${encodeURIComponent(warnings.join(" "))}` : "?created=1";
  throw redirect(`/app/charts/${chart.id}${query}`);
};

export default function NewChart() {
  const { templates, canCreate, csvAllowed, plan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.ok) {
      shopify.toast.show(fetcher.data.message, { isError: true });
    }
  }, [fetcher.state, fetcher.data, shopify]);

  const [group, setGroup] = useState<string>("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return templates.filter((t) => {
      if (group !== "All" && t.group !== group) return false;
      const haystack = `${t.name} ${t.description} ${t.group} ${t.columns.join(" ")}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [templates, group, query]);
  const lockedCount = templates.filter((t) => t.locked).length;

  const onFile = async (event: Event) => {
    const files = (event.currentTarget as unknown as { files?: readonly File[] }).files ?? [];
    const file = files[0];
    if (!file) return;
    if (file.size > 200_000) {
      shopify.toast.show("That file is too large for a size chart", { isError: true });
      return;
    }
    fetcher.submit({ intent: "csv", csv: await file.text(), name: file.name }, { method: "post" });
  };

  if (!canCreate) {
    return (
      <s-page heading="Create size chart">
        <s-link slot="breadcrumb-actions" href="/app/charts">
          Size charts
        </s-link>
        <s-section>
          <s-empty-state heading={`You're using the ${PLANS[plan].chartLimit} size chart on the ${PLANS[plan].name} plan`}>
            <s-paragraph slot="subheading">
              Upgrade to Pro for unlimited charts, so each kind of product gets the right one. Your current chart stays as it is.
            </s-paragraph>
            <s-button slot="primary-action" variant="primary" href="/app/plans">
              See plans
            </s-button>
            <s-button slot="secondary-actions" href="/app/charts">
              Back to size charts
            </s-button>
          </s-empty-state>
        </s-section>
      </s-page>
    );
  }

  return (
    <s-page heading="Create size chart" inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app/charts">
        Size charts
      </s-link>

      {lockedCount > 0 && (
        <s-banner tone="info" heading={`${templates.length - lockedCount} templates are on your plan, ${lockedCount} more with Pro`}>
          <s-paragraph>
            Free includes {ESSENTIAL_COUNT} essentials. Pro unlocks the full library: plus sizes, jeans, bras, swimwear, suits, rings,
            pet harnesses and more, each with real measurements to start from.
          </s-paragraph>
          <s-button slot="secondary-actions" href="/app/plans">
            See plans
          </s-button>
        </s-banner>
      )}

      <s-section>
        <s-stack gap="base">
          <s-text-field
            label="Search templates"
            labelAccessibilityVisibility="exclusive"
            icon="search"
            placeholder="Search: jeans, bra, ring, dog…"
            value={query}
            onInput={(e) => setQuery(valueOf(e))}
          />
          <div className="sm-chips" role="group" aria-label="Category">
            {["All", ...TEMPLATE_GROUPS].map((name) => (
              <button key={name} type="button" aria-pressed={group === name} onClick={() => setGroup(name)}>
                {name}
              </button>
            ))}
          </div>
          {visible.length === 0 && <s-text color="subdued">No templates match. Try another word, or start from a blank chart.</s-text>}
          <s-grid gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap="base">
            {visible.map((template) => (
              <s-clickable
                key={template.key}
                border="base"
                borderRadius="base"
                padding="base"
                disabled={busy}
                accessibilityLabel={template.locked ? `${template.name}, on the Pro plan` : `Use the ${template.name} template`}
                onClick={() =>
                  template.locked
                    ? shopify.toast.show(`“${template.name}” is in the Pro template library`, { action: "See plans", onAction: () => navigate("/app/plans") })
                    : fetcher.submit({ intent: "template", template: template.key }, { method: "post" })
                }
              >
                <div className="sm-template">
                  {template.figure ? (
                    <div className="sizemate sm-template-figure" aria-hidden="true" dangerouslySetInnerHTML={{ __html: template.figure }} />
                  ) : (
                    <div className="sm-template-figure sm-template-figure--empty" aria-hidden="true" />
                  )}
                  <s-stack gap="small-200">
                    <s-stack direction="inline" gap="small-200" alignItems="center">
                      <s-text type="strong">{template.name}</s-text>
                      {template.locked && (
                        <s-badge tone="info" icon="lock">
                          Pro
                        </s-badge>
                      )}
                    </s-stack>
                    <s-text color="subdued">{template.description}</s-text>
                  </s-stack>
                </div>
                {template.key !== "blank" && (
                  <s-box paddingBlockStart="small-200">
                    <table className="sm-template-table" aria-hidden="true">
                      <thead>
                        <tr>
                          {template.columns.map((label) => (
                            <th key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {template.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, i) => (
                              <td key={i}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </s-box>
                )}
              </s-clickable>
            ))}
          </s-grid>
        </s-stack>
      </s-section>

      <s-section heading="Import from a spreadsheet">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-paragraph>
              Upload a CSV with sizes in the first column and one column per measurement, such as “Chest (cm)”. Excel and Google Sheets
              exports both work.
            </s-paragraph>
            <FeatureBadge feature="csv" plan={plan} />
          </s-stack>
          {csvAllowed ? (
            <s-drop-zone label="Upload CSV" accept=".csv,text/csv" onChange={onFile} disabled={busy} />
          ) : (
            <s-stack direction="inline" gap="base">
              <s-button href="/app/plans">Upgrade to import</s-button>
              <s-text color="subdued">Or copy the cells in your spreadsheet and paste them into any template.</s-text>
            </s-stack>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
