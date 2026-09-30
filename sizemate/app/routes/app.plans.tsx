import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { PlanBadge } from "../components/ui";
import { FEATURE_LABELS, PLAN_ORDER, PLANS, TRIAL_DAYS } from "../lib/plans";
import { pricingPageUrl } from "../models/billing.server";
import { countCharts } from "../models/charts.server";
import { adminContext } from "../models/context.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan } = await adminContext(request);
  return { plan, charts: await countCharts(shop), pricingUrl: pricingPageUrl(shop) };
};

const COMPARISON: { label: string; free: string | boolean; pro: string | boolean; plus: string | boolean }[] = [
  { label: "Size charts", free: "1", pro: "Unlimited", plus: "Unlimited" },
  { label: "Products per chart", free: "Unlimited", pro: "Unlimited", plus: "Unlimited" },
  { label: "Ready-made templates", free: true, pro: true, plus: true },
  { label: "cm / inch switch for shoppers", free: true, pro: true, plus: true },
  { label: "Measuring guide with pictures", free: true, pro: true, plus: true },
  { label: "Interface in 8 languages", free: true, pro: true, plus: true },
  { label: "Rules by collection, type, vendor, tag or product", free: true, pro: true, plus: true },
  { label: FEATURE_LABELS.customStyle, free: false, pro: true, plus: true },
  { label: FEATURE_LABELS.csv, free: false, pro: true, plus: true },
  { label: FEATURE_LABELS.removeBranding, free: false, pro: true, plus: true },
  { label: FEATURE_LABELS.fitFinder, free: false, pro: false, plus: true },
  { label: FEATURE_LABELS.translations, free: false, pro: false, plus: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <s-text>{value}</s-text>;
  return value ? <s-icon type="check" tone="success" /> : <s-text color="subdued">—</s-text>;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "How does the free trial work?",
    a: `Paid plans start with a ${TRIAL_DAYS}-day free trial. Cancel before it ends and you pay nothing. Billing goes through your Shopify invoice.`,
  },
  {
    q: "What happens to my charts if I downgrade?",
    a: "Nothing is deleted. On Free, the chart at the top of your list stays live and the others are paused until you upgrade again.",
  },
  {
    q: "Does Sizemate slow down my store?",
    a: "No. It never edits your theme code, and everything loads from Shopify's own CDN with no extra requests to our servers.",
  },
  {
    q: "Is the Fit Finder AI?",
    a: "No. It compares the shopper's measurements with your own chart. The measurements stay in the shopper's browser and are never stored.",
  },
];

export default function Plans() {
  const { plan, charts, pricingUrl } = useLoaderData<typeof loader>();
  const [yearly, setYearly] = useState(false);

  return (
    <s-page heading="Plans" inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app">
        Home
      </s-link>

      <s-section>
        <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-text>Current plan:</s-text>
            <PlanBadge plan={plan} />
            <s-text color="subdued">
              {charts} size {charts === 1 ? "chart" : "charts"}
            </s-text>
          </s-stack>
          <s-stack direction="inline" gap="small-200">
            <s-button variant={yearly ? "secondary" : "primary"} onClick={() => setYearly(false)}>
              Monthly
            </s-button>
            <s-button variant={yearly ? "primary" : "secondary"} onClick={() => setYearly(true)}>
              Yearly (2 months free)
            </s-button>
          </s-stack>
        </s-stack>
      </s-section>

      <s-grid gridTemplateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap="base">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const current = id === plan;
          const price = yearly ? p.yearlyPrice : p.monthlyPrice;
          const higher = PLAN_ORDER.indexOf(id) > PLAN_ORDER.indexOf(plan);
          return (
            <s-section key={id}>
              <s-stack gap="base">
                <s-stack direction="inline" gap="small-200" alignItems="center">
                  <s-heading>{p.name}</s-heading>
                  {current && <s-badge tone="success">Current</s-badge>}
                  {id === "plus" && !current && <s-badge tone="info">Best for fewer returns</s-badge>}
                </s-stack>
                <s-text color="subdued">{p.tagline}</s-text>
                <s-stack direction="inline" gap="small-200" alignItems="end">
                  <s-heading>{price === 0 ? "Free" : `$${price.toFixed(2)}`}</s-heading>
                  {price > 0 && <s-text color="subdued">/ {yearly ? "year" : "month"}</s-text>}
                </s-stack>
                <s-unordered-list>
                  {p.highlights.map((h) => (
                    <s-list-item key={h}>{h}</s-list-item>
                  ))}
                </s-unordered-list>
                {current ? (
                  <s-button disabled>Your plan</s-button>
                ) : (
                  <s-button variant={higher ? "primary" : "secondary"} href={pricingUrl} target="_top">
                    {higher ? (price > 0 ? `Start ${TRIAL_DAYS}-day free trial` : `Choose ${p.name}`) : `Switch to ${p.name}`}
                  </s-button>
                )}
              </s-stack>
            </s-section>
          );
        })}
      </s-grid>

      <s-section heading="Compare plans" padding="none">
        <s-table>
          <s-table-header-row>
            <s-table-header listSlot="primary">Feature</s-table-header>
            {PLAN_ORDER.map((id) => (
              <s-table-header key={id}>{PLANS[id].name}</s-table-header>
            ))}
          </s-table-header-row>
          <s-table-body>
            {COMPARISON.map((row) => (
              <s-table-row key={row.label}>
                <s-table-cell>{row.label}</s-table-cell>
                {PLAN_ORDER.map((id) => (
                  <s-table-cell key={id}>
                    <Cell value={row[id]} />
                  </s-table-cell>
                ))}
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>

      <s-section heading="Questions">
        <s-stack gap="base">
          {FAQ.map((item) => (
            <s-stack key={item.q} gap="small-200">
              <s-text type="strong">{item.q}</s-text>
              <s-paragraph color="subdued">{item.a}</s-paragraph>
            </s-stack>
          ))}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
