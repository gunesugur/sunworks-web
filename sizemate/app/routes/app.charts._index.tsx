import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";

import { formatDate } from "../components/ui";
import { describeAssignment } from "../lib/chart";
import { canCreateChart, chartCount, PLANS } from "../lib/plans";
import { buildPublication } from "../lib/publish";
import { deleteChart, duplicate, listCharts, move, PlanLimitError, setStatus } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { publish } from "../models/publisher.server";
import { getShop, settingsOf } from "../models/shop.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan } = await adminContext(request);
  const [record, stored] = await Promise.all([getShop(shop), listCharts(shop)]);
  const publication = buildPublication(
    stored.map((s) => s.chart),
    settingsOf(record),
    plan,
  );
  const paused = new Set(publication.paused);
  return {
    plan,
    canCreate: canCreateChart(plan, stored.length),
    charts: stored.map(({ chart, updatedAt }) => ({
      id: chart.id,
      name: chart.name,
      title: chart.title,
      status: paused.has(chart.id) ? ("paused" as const) : chart.status,
      shownOn: describeAssignment(chart.assignment),
      sizes: chart.rows.length,
      updatedAt: updatedAt.toISOString(),
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shop, plan } = await adminContext(request);
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  let message = "";
  try {
    switch (form.get("intent")) {
      case "duplicate":
        if (!(await duplicate(shop, id, plan))) return { ok: false, message: "Size chart not found" };
        message = "Size chart duplicated as a draft";
        break;
      case "delete":
        if (!(await deleteChart(shop, id))) return { ok: false, message: "Size chart not found" };
        message = "Size chart deleted";
        break;
      case "up":
      case "down":
        await move(shop, id, form.get("intent") === "up" ? "up" : "down");
        message = "Order updated";
        break;
      case "activate":
      case "draft":
        await setStatus(shop, id, form.get("intent") === "activate" ? "active" : "draft");
        message = form.get("intent") === "activate" ? "Size chart is live" : "Size chart set to draft";
        break;
      default:
        return { ok: false, message: "Unknown action" };
    }
  } catch (error) {
    if (error instanceof PlanLimitError) return { ok: false, message: error.message, upgrade: true };
    throw error;
  }
  try {
    await publish(shop, admin);
  } catch (error) {
    return { ok: false, message: `Saved, but your store wasn't updated: ${error instanceof Error ? error.message : "unknown error"}` };
  }
  return { ok: true, message };
};

const STATUS = {
  active: { tone: "success", label: "Active" },
  draft: { tone: "neutral", label: "Draft" },
  paused: { tone: "warning", label: "Paused" },
} as const;

export default function Charts() {
  const { charts, plan, canCreate } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.message) {
      shopify.toast.show(fetcher.data.message, { isError: !fetcher.data.ok });
    }
  }, [fetcher.state, fetcher.data, shopify]);

  const run = (intent: string, id: string) => fetcher.submit({ intent, id }, { method: "post" });
  const busy = fetcher.state !== "idle";

  return (
    <s-page heading="Size charts">
      <s-link slot="breadcrumb-actions" href="/app">
        Home
      </s-link>
      <s-button slot="primary-action" variant="primary" href="/app/charts/new">
        Create size chart
      </s-button>

      {!canCreate && (
        <s-banner tone="info" heading={`The ${PLANS[plan].name} plan includes ${chartCount(PLANS[plan].chartLimit)}`}>
          <s-paragraph>Upgrade to Pro for unlimited charts, so tops, trousers and shoes each get the right one.</s-paragraph>
          <s-button slot="secondary-actions" href="/app/plans">
            See plans
          </s-button>
        </s-banner>
      )}

      {charts.length === 0 ? (
        <s-section>
          <s-empty-state heading="Create your first size chart">
            <s-paragraph slot="subheading">
              Pick a template for tops, trousers, shoes, kids or pets, then adjust the numbers to your brand. It takes about two minutes.
            </s-paragraph>
            <s-button slot="primary-action" variant="primary" href="/app/charts/new">
              Choose a template
            </s-button>
          </s-empty-state>
        </s-section>
      ) : (
        <s-section padding="none" accessibilityLabel="Size charts">
          <s-table loading={busy}>
            <s-table-header-row>
              <s-table-header listSlot="primary">Name</s-table-header>
              <s-table-header listSlot="secondary">Status</s-table-header>
              <s-table-header listSlot="labeled">Shown on</s-table-header>
              <s-table-header format="numeric">Sizes</s-table-header>
              <s-table-header>Updated</s-table-header>
              <s-table-header>
                <s-text accessibilityVisibility="exclusive">Actions</s-text>
              </s-table-header>
            </s-table-header-row>
            <s-table-body>
              {charts.map((chart, index) => (
                <s-table-row key={chart.id}>
                  <s-table-cell>
                    <s-stack gap="none">
                      <s-link href={`/app/charts/${chart.id}`}>{chart.name}</s-link>
                      {chart.title && chart.title !== chart.name && <s-text color="subdued">{chart.title}</s-text>}
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge tone={STATUS[chart.status].tone}>{STATUS[chart.status].label}</s-badge>
                  </s-table-cell>
                  <s-table-cell>{chart.shownOn}</s-table-cell>
                  <s-table-cell>{chart.sizes}</s-table-cell>
                  <s-table-cell>{formatDate(chart.updatedAt)}</s-table-cell>
                  <s-table-cell>
                    <s-stack direction="inline" gap="none" justifyContent="end">
                      <s-button
                        variant="tertiary"
                        icon="arrow-up"
                        accessibilityLabel={`Move ${chart.name} up`}
                        disabled={index === 0 || busy}
                        onClick={() => run("up", chart.id)}
                      />
                      <s-button
                        variant="tertiary"
                        icon="arrow-down"
                        accessibilityLabel={`Move ${chart.name} down`}
                        disabled={index === charts.length - 1 || busy}
                        onClick={() => run("down", chart.id)}
                      />
                      <s-button variant="tertiary" icon="menu-horizontal" accessibilityLabel={`More actions for ${chart.name}`} commandFor={`menu-${chart.id}`} />
                      <s-menu id={`menu-${chart.id}`} accessibilityLabel={`Actions for ${chart.name}`}>
                        <s-button icon="edit" href={`/app/charts/${chart.id}`}>
                          Edit
                        </s-button>
                        <s-button icon="duplicate" onClick={() => run("duplicate", chart.id)} disabled={!canCreate}>
                          Duplicate
                        </s-button>
                        {chart.status === "draft" ? (
                          <s-button icon="view" onClick={() => run("activate", chart.id)}>
                            Make active
                          </s-button>
                        ) : (
                          <s-button icon="archive" onClick={() => run("draft", chart.id)}>
                            Set as draft
                          </s-button>
                        )}
                        <s-button
                          icon="delete"
                          tone="critical"
                          commandFor="delete-modal"
                          command="--show"
                          onClick={() => setPendingDelete({ id: chart.id, name: chart.name })}
                        >
                          Delete
                        </s-button>
                      </s-menu>
                    </s-stack>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      )}

      {charts.length > 1 && (
        <s-section heading="Which chart does a product get?">
          <s-paragraph>
            The most specific chart wins: one that lists the product itself, then one that matches its collection, type, vendor or tag,
            then one for all products. If two charts are equally specific, the one higher in this list wins. Use the arrows to change the order.
          </s-paragraph>
        </s-section>
      )}

      <s-modal id="delete-modal" heading="Delete size chart?">
        <s-paragraph>
          {pendingDelete ? `“${pendingDelete.name}” will be removed from your store right away. This can't be undone.` : ""}
        </s-paragraph>
        <s-button slot="secondary-actions" commandFor="delete-modal" command="--hide">
          Cancel
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          tone="critical"
          commandFor="delete-modal"
          command="--hide"
          onClick={() => pendingDelete && run("delete", pendingDelete.id)}
        >
          Delete
        </s-button>
      </s-modal>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
