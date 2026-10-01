import { boundary } from "@shopify/shopify-app-react-router/server";
import { useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { AccessBanner } from "../components/AccessBanner";
import { PlanBadge } from "../components/ui";
import { FEATURE_LABELS, PLAN_ORDER, PLANS, TRIAL_DAYS, WELCOME_DAYS } from "../lib/plans";
import { ESSENTIAL_COUNT, TEMPLATES } from "../lib/templates";
import { accessNotice } from "../models/access.server";
import { pricingPageUrl } from "../models/billing.server";
import { countCharts } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { getShop } from "../models/shop.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop, plan, access } = await adminContext(request);
  const record = await getShop(shop);
  return {
    plan,
    subscribed: (record.subscribedPlan as typeof plan) ?? "free",
    notice: await accessNotice(shop, access, record),
    charts: await countCharts(shop),
    pricingUrl: pricingPageUrl(shop),
  };
};

const COMPARISON: { label: string; free: string | boolean; pro: string | boolean; plus: string | boolean }[] = [
  { label: "Size charts", free: "2", pro: "Unlimited", plus: "Unlimited" },
  { label: "Products per chart", free: "Unlimited", pro: "Unlimited", plus: "Unlimited" },
  { label: "Templates", free: `${ESSENTIAL_COUNT - 1} essentials`, pro: `All ${TEMPLATES.length - 1}`, plus: `All ${TEMPLATES.length - 1}` },
  { label: "Matches your theme's fonts and colours, light and dark", free: true, pro: true, plus: true },
  { label: "Numbered measuring illustrations", free: true, pro: true, plus: true },
  { label: "Metric and imperial: cm, mm, in, ft, kg, lb", free: true, pro: true, plus: true },
  { label: "Accessibility: keyboard, screen readers, larger text, high contrast", free: true, pro: true, plus: true },
  { label: "Rules by collection, type, vendor, tag or product", free: true, pro: true, plus: true },
  { label: "Fit Finder (size recommendations, unlimited)", free: false, pro: true, plus: true },
  { label: "Styles", free: "3", pro: "7 + design studio", plus: "7 + design studio" },
  { label: "Drawer, in-page and picture-card layouts", free: false, pro: true, plus: true },
  { label: "Photo card and fit scale", free: false, pro: true, plus: true },
  { label: FEATURE_LABELS.csv, free: false, pro: true, plus: true },
  { label: FEATURE_LABELS.removeBranding, free: false, pro: true, plus: true },
  { label: "Size memory: returning shoppers see their size on every product", free: false, pro: false, plus: true },
  { label: "Insights: views, recommended sizes, missing-size alerts", free: false, pro: false, plus: true },
  { label: FEATURE_LABELS.translations, free: false, pro: false, plus: true },
  { label: "Priority support and chart setup done for you", free: false, pro: false, plus: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <s-text>{value}</s-text>;
  return value ? <s-icon type="check" tone="success" /> : <s-text color="subdued">—</s-text>;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "What do I get when I install?",
    a: `Every Plus feature free for ${WELCOME_DAYS} days, no card needed. Afterwards you keep Free, or choose Pro or Plus. You'll see what would change a few days before.`,
  },
  {
    q: "How does the free trial work?",
    a: `Pro and Plus start with a ${TRIAL_DAYS}-day free trial in Shopify. Cancel before it ends and you pay nothing. Billing goes through your Shopify invoice.`,
  },
  {
    q: "What happens if I cancel or downgrade?",
    a: "You keep your plan until the end of the period you paid for; the app shows the date. Then the lower plan applies. Nothing is deleted: extra charts are paused and come back when you upgrade.",
  },
  {
    q: "Does Sizemate slow down my store?",
    a: "No. The page script is 2.5 KB, it never edits your theme code, and everything loads from Shopify's CDN. The chart works even if our servers are down.",
  },
  {
    q: "Is the Fit Finder AI? Are there usage limits?",
    a: "It compares the shopper's measurements with your own chart, in their browser. There are no limits or per-recommendation fees, and measurements are never sent to us.",
  },
];

export default function Plans() {
  const { plan, subscribed, notice, charts, pricingUrl } = useLoaderData<typeof loader>();
  const [yearly, setYearly] = useState(false);

  return (
    <s-page heading="Plans" inlineSize="large">
      <s-link slot="breadcrumb-actions" href="/app">
        Home
      </s-link>

      <AccessBanner notice={notice} />

      <s-section>
        <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
          <s-stack direction="inline" gap="small-200" alignItems="center">
            <s-text>Current plan:</s-text>
            <PlanBadge plan={plan} />
            <s-text color="subdued">
              {charts} size {charts === 1 ? "chart" : "charts"}
              {notice.source === "subscription" && notice.renewsAt && !notice.trialEndsAt
                ? ` · renews ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(notice.renewsAt))}`
                : ""}
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
          // The plan button reflects the subscription; the welcome period or a paid period doesn't count as "yours".
          const current = id === subscribed;
          const price = yearly ? p.yearlyPrice : p.monthlyPrice;
          const higher = PLAN_ORDER.indexOf(id) > PLAN_ORDER.indexOf(subscribed);
          return (
            <s-section key={id}>
              <s-stack gap="base">
                <s-stack direction="inline" gap="small-200" alignItems="center">
                  <s-heading>{p.name}</s-heading>
                  {current && <s-badge tone="success">Current</s-badge>}
                  {id === "pro" && !current && <s-badge tone="info">Most popular</s-badge>}
                  {id === plan && id !== subscribed && <s-badge>Active until {notice.endsAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(notice.endsAt)) : "now"}</s-badge>}
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
