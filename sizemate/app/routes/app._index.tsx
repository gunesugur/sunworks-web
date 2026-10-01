import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";

import { SetupGuide, type SetupStep } from "../components/SetupGuide";
import { formatDate, PlanBadge } from "../components/ui";
import { SUPPORT_EMAIL } from "../lib/brand";
import { chartCount, PLANS } from "../lib/plans";
import { buildPublication } from "../lib/publish";
import { listCharts } from "../models/charts.server";
import { adminContext } from "../models/context.server";
import { publish } from "../models/publisher.server";
import { getShop, onboardingOf, settingsOf, updateOnboarding } from "../models/shop.server";
import { getThemeStatus, themeEditorLinks } from "../models/theme.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, shop, plan } = await adminContext(request);
  const [record, stored, theme] = await Promise.all([getShop(shop), listCharts(shop), getThemeStatus(admin)]);
  const charts = stored.map((s) => s.chart);
  const publication = buildPublication(charts, settingsOf(record), plan);
  return {
    plan,
    total: charts.length,
    live: publication.config.rules.length,
    paused: publication.paused.length,
    drafts: charts.filter((c) => c.status === "draft").length,
    theme,
    links: themeEditorLinks(shop, process.env.SHOPIFY_API_KEY || ""),
    onboarding: onboardingOf(record),
    publishedAt: record.publishedAt?.toISOString() ?? null,
    publishError: record.publishError,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shop } = await adminContext(request);
  const form = await request.formData();
  switch (form.get("intent")) {
    case "dismiss-guide":
      await updateOnboarding(shop, { guideDismissed: true });
      return { ok: true };
    case "theme-opened":
      await updateOnboarding(shop, { themeEditorOpened: true });
      return { ok: true };
    case "previewed":
      await updateOnboarding(shop, { previewed: true });
      return { ok: true };
    case "republish":
      try {
        await publish(shop, admin);
        return { ok: true, message: "Your store is up to date" };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Publishing failed" };
      }
    default:
      return { ok: false, message: "Unknown action" };
  }
};

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const plan = PLANS[data.plan];

  useEffect(() => {
    if (fetcher.data && "message" in fetcher.data && fetcher.data.message) {
      shopify.toast.show(fetcher.data.message, { isError: !fetcher.data.ok });
    }
  }, [fetcher.data, shopify]);

  const mark = (intent: string) => fetcher.submit({ intent }, { method: "post" });
  const themeOn = data.theme.embedEnabled === true || data.theme.blockOnProductPage === true;
  const themeKnown = data.theme.embedEnabled !== null;

  const steps: SetupStep[] = [
    {
      id: "chart",
      title: "Create your first size chart",
      description: "Start from one of 10 templates or paste your own table from a spreadsheet.",
      done: data.total > 0,
      action: (
        <s-button variant="primary" href="/app/charts/new">
          Create size chart
        </s-button>
      ),
    },
    {
      id: "theme",
      title: "Turn on Sizemate in your theme",
      description:
        "One switch in the theme editor adds the size chart button to your product pages. No code, and your theme files stay untouched.",
      done: themeOn || (!themeKnown && Boolean(data.onboarding.themeEditorOpened)),
      action: (
        <s-stack direction="inline" gap="base">
          <s-button variant="primary" href={data.links.activateEmbed} target="_top" onClick={() => mark("theme-opened")}>
            Turn on in theme editor
          </s-button>
          <s-button variant="tertiary" href={data.links.addBlock} target="_top" onClick={() => mark("theme-opened")}>
            Or place it as a block
          </s-button>
        </s-stack>
      ),
    },
    {
      id: "preview",
      title: "Check a product page",
      description: "Open a product in the theme editor and click the size chart button to see what shoppers see.",
      done: Boolean(data.onboarding.previewed),
      action: (
        <s-button variant="primary" href={data.links.productTemplate} target="_top" onClick={() => mark("previewed")}>
          Preview product page
        </s-button>
      ),
    },
  ];
  const setupComplete = steps.every((s) => s.done);

  return (
    <s-page heading="Sizemate">
      <s-button slot="primary-action" variant="primary" href="/app/charts/new">
        Create size chart
      </s-button>

      {data.publishError && (
        <s-banner tone="critical" heading="Your latest changes aren't on your store yet">
          <s-paragraph>{data.publishError}</s-paragraph>
          <s-button slot="secondary-actions" onClick={() => mark("republish")}>
            Try again
          </s-button>
        </s-banner>
      )}

      {data.paused > 0 && (
        <s-banner tone="warning" heading={`${data.paused} size ${data.paused === 1 ? "chart is" : "charts are"} paused`}>
          <s-paragraph>
            The {plan.name} plan shows {chartCount(plan.chartLimit)} on your store. Your other charts are saved and come back as soon as you upgrade.
          </s-paragraph>
          <s-button slot="secondary-actions" href="/app/plans">
            See plans
          </s-button>
        </s-banner>
      )}

      {data.theme.embedEnabled === false && data.theme.blockOnProductPage === false && data.total > 0 && setupComplete && (
        <s-banner tone="warning" heading="Sizemate is switched off in your theme">
          <s-paragraph>Shoppers can&apos;t see your size charts until the app embed is on{data.theme.themeName ? ` in ${data.theme.themeName}` : ""}.</s-paragraph>
          <s-button slot="secondary-actions" href={data.links.activateEmbed} target="_top">
            Turn on
          </s-button>
        </s-banner>
      )}

      {!(setupComplete && data.onboarding.guideDismissed) && (
        <SetupGuide steps={steps} onDismiss={setupComplete ? () => mark("dismiss-guide") : undefined} />
      )}

      <s-section heading="Overview">
        <s-grid gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="base">
          <s-box padding="base" borderRadius="base" border="base">
            <s-stack gap="small-200">
              <s-text color="subdued">Live size charts</s-text>
              <s-heading>{data.live}</s-heading>
              <s-text color="subdued">
                {data.total} total{data.drafts ? `, ${data.drafts} draft` : ""}
                {data.paused ? `, ${data.paused} paused` : ""}
              </s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderRadius="base" border="base">
            <s-stack gap="small-200">
              <s-text color="subdued">Theme</s-text>
              <s-stack direction="inline" gap="small-200" alignItems="center">
                {themeOn ? (
                  <s-badge tone="success" icon="check">
                    On
                  </s-badge>
                ) : themeKnown ? (
                  <s-badge tone="warning">Off</s-badge>
                ) : (
                  <s-badge>Unknown</s-badge>
                )}
                <s-text>{data.theme.themeName ?? "Live theme"}</s-text>
              </s-stack>
              <s-link href={data.links.activateEmbed} target="_top">
                Open theme editor
              </s-link>
            </s-stack>
          </s-box>
          <s-box padding="base" borderRadius="base" border="base">
            <s-stack gap="small-200">
              <s-text color="subdued">Plan</s-text>
              <s-stack direction="inline" gap="small-200" alignItems="center">
                <PlanBadge plan={data.plan} />
                <s-text>{Number.isFinite(plan.chartLimit) ? `${Math.min(data.total, plan.chartLimit)} of ${plan.chartLimit} charts used` : "Unlimited charts"}</s-text>
              </s-stack>
              <s-link href="/app/plans">{data.plan === "plus" ? "Manage plan" : "Compare plans"}</s-link>
            </s-stack>
          </s-box>
        </s-grid>
        <s-box paddingBlockStart="base">
          <s-text color="subdued">Last published to your store: {formatDate(data.publishedAt)}</s-text>
        </s-box>
      </s-section>

      {data.plan === "free" && (
        <s-section heading="Do more with Pro">
          <s-stack gap="base">
            <s-unordered-list>
              <s-list-item>Fit Finder: shoppers enter their measurements and get their size from your chart, with one click to select it.</s-list-item>
              <s-list-item>The full template library, from plus sizes and jeans to bras, rings and dog harnesses.</s-list-item>
              <s-list-item>Design studio: 7 styles, your colours and fonts, drawer and in-page layouts, a photo card beside the chart.</s-list-item>
              <s-list-item>Unlimited charts, a fit scale, CSV import and no Sizemate branding.</s-list-item>
            </s-unordered-list>
            <s-stack direction="inline" gap="base">
              <s-button variant="primary" href="/app/plans">
                Try Pro free for 7 days
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>
      )}

      {data.plan === "pro" && (
        <s-section heading="Size advice on every product with Plus">
          <s-stack gap="base">
            <s-paragraph>
              Add the Fit Finder to shoes, bras, rings, pet products and your own charts, translate charts into every store language, and
              see Insights: how often shoppers open your charts and which sizes they get.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href="/app/plans">See the Plus plan</s-button>
            </s-stack>
          </s-stack>
        </s-section>
      )}

      <s-section slot="aside" heading="How Sizemate works">
        <s-ordered-list>
          <s-list-item>Create a chart from a template, a spreadsheet or scratch.</s-list-item>
          <s-list-item>Choose which products show it: everything, or by collection, type, vendor, tag or product.</s-list-item>
          <s-list-item>Sizemate adds a size chart button to those product pages, in your shopper&apos;s language.</s-list-item>
        </s-ordered-list>
      </s-section>

      <s-section slot="aside" heading="Built to stay out of your way">
        <s-unordered-list>
          <s-list-item>Never edits your theme code. Uninstalling leaves nothing behind.</s-list-item>
          <s-list-item>Loads from Shopify&apos;s CDN and matches your theme, light or dark, with no setup.</s-list-item>
          <s-list-item>Stores no shopper data.</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Need help?">
        <s-paragraph>
          Email <s-link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</s-link> and we&apos;ll help you set things up.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
