import { boundary } from "@shopify/shopify-app-react-router/server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { UpgradeCallout } from "../components/ui";
import { hasFeature } from "../lib/plans";
import { listCharts } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { loadInsights } from "../models/insights.server";

const DAYS = 30;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan } = await adminContext(request);
  const allowed = hasFeature(plan, "insights");
  const [insights, charts] = await Promise.all([allowed ? loadInsights(shop, DAYS) : null, listCharts(shop)]);
  const names = Object.fromEntries(charts.map((stored) => [stored.chart.id, stored.chart.name]));
  return { plan, allowed, insights, names };
};

function percent(part: number, whole: number): string {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

export default function Insights() {
  const { allowed, insights, names } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Insights" inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app">
        Home
      </s-link>

      {!allowed && (
        <UpgradeCallout feature="insights">
          <s-paragraph>
            See how often shoppers open each chart, how many use the Fit Finder, which sizes they get, and whether your chart is missing a
            size. Counts are anonymous: no shopper data is stored.
          </s-paragraph>
        </UpgradeCallout>
      )}

      {allowed && insights && (
        <>
          <s-section heading={`Last ${DAYS} days`}>
            <s-grid gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="base">
              <s-box padding="base" border="base" borderRadius="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Chart views</s-text>
                  <s-heading>{insights.totals.opens.toLocaleString("en")}</s-heading>
                </s-stack>
              </s-box>
              <s-box padding="base" border="base" borderRadius="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Fit Finder recommendations</s-text>
                  <s-heading>{insights.totals.fits.toLocaleString("en")}</s-heading>
                </s-stack>
              </s-box>
              <s-box padding="base" border="base" borderRadius="base">
                <s-stack gap="small-200">
                  <s-text color="subdued">Viewers who used the Fit Finder</s-text>
                  <s-heading>{percent(insights.totals.fits, insights.totals.opens)}</s-heading>
                </s-stack>
              </s-box>
            </s-grid>
          </s-section>

          {insights.charts.length === 0 ? (
            <s-section>
              <s-paragraph>
                No activity yet. Counts appear here as shoppers open your size charts. It can take a few minutes after the first visits.
              </s-paragraph>
            </s-section>
          ) : (
            insights.charts.map((chart) => (
              <s-section key={chart.chartId} heading={names[chart.chartId] ?? "Deleted chart"}>
                <s-stack gap="base">
                  <s-stack direction="inline" gap="large">
                    <s-text>
                      <s-text type="strong">{chart.opens.toLocaleString("en")}</s-text> views
                    </s-text>
                    <s-text>
                      <s-text type="strong">{chart.fits.toLocaleString("en")}</s-text> recommendations
                    </s-text>
                    <s-text>
                      <s-text type="strong">{percent(chart.above + chart.below, chart.fits)}</s-text> outside your sizes
                    </s-text>
                  </s-stack>
                  {chart.hints.map((hint) => (
                    <s-banner key={hint} tone="info">
                      <s-paragraph>{hint}</s-paragraph>
                    </s-banner>
                  ))}
                  {chart.sizes.length > 0 && (
                    <s-table>
                      <s-table-header-row>
                        <s-table-header>Recommended size</s-table-header>
                        <s-table-header format="numeric">Shoppers</s-table-header>
                        <s-table-header format="numeric">Share</s-table-header>
                      </s-table-header-row>
                      <s-table-body>
                        {chart.sizes.slice(0, 12).map((row) => (
                          <s-table-row key={row.size}>
                            <s-table-cell>{row.size}</s-table-cell>
                            <s-table-cell>{row.count.toLocaleString("en")}</s-table-cell>
                            <s-table-cell>{percent(row.count, chart.fits)}</s-table-cell>
                          </s-table-row>
                        ))}
                      </s-table-body>
                    </s-table>
                  )}
                </s-stack>
              </s-section>
            ))
          )}

          <s-section slot="aside" heading="About these numbers">
            <s-paragraph>
              Sizemate counts chart views and Fit Finder results per day. It never stores measurements, names or anything else about
              shoppers. Use the size breakdown when you plan stock, and the hints to spot sizes your chart is missing.
            </s-paragraph>
          </s-section>
        </>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
