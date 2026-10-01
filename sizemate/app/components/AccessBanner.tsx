import { PLANS } from "../lib/plans";
import type { AccessNotice } from "../models/access.server";

function day(iso: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(iso));
}

function Changes({ changes }: { changes: string[] }) {
  if (!changes.length) return null;
  return (
    <s-unordered-list>
      {changes.map((change) => (
        <s-list-item key={change}>{change}</s-list-item>
      ))}
    </s-unordered-list>
  );
}

/**
 * Tells the merchant, ahead of time and in their own terms, when paid
 * features end and what changes: the welcome period, a cancelled plan, a
 * payment problem. `compact` shows only the urgent cases (for inner pages).
 */
export function AccessBanner({ notice, compact = false }: { notice: AccessNotice; compact?: boolean }) {
  const plan = PLANS[notice.plan];
  const next = PLANS[notice.next];

  if (notice.frozen) {
    return (
      <s-banner tone="critical" heading="Your subscription is on hold">
        <s-paragraph>
          Shopify paused your Sizemate subscription because of a payment problem, so paid features are off. They come back as soon as the
          bill is settled in Settings › Billing.
        </s-paragraph>
      </s-banner>
    );
  }

  if (notice.source === "welcome" && notice.endsAt) {
    const urgent = (notice.daysLeft ?? 0) <= 4;
    if (compact && !urgent) return null;
    return (
      <s-banner
        tone={urgent ? "warning" : "info"}
        heading={`You're trying every Plus feature free until ${day(notice.endsAt)} (${notice.daysLeft} ${notice.daysLeft === 1 ? "day" : "days"} left)`}
      >
        <s-paragraph>
          {notice.next === "free"
            ? "No card needed. Choose a plan to keep what you use; otherwise your store moves to Free:"
            : `After that your ${next.name} plan continues. You'll no longer have:`}
        </s-paragraph>
        <Changes changes={notice.changes} />
        <s-button slot="secondary-actions" variant="primary" href="/app/plans">
          Choose a plan
        </s-button>
      </s-banner>
    );
  }

  if (notice.source === "paid-period" && notice.endsAt) {
    return (
      <s-banner tone="warning" heading={`Your ${plan.name} plan ends on ${day(notice.endsAt)}`}>
        <s-paragraph>
          You&apos;ve paid until then, so everything keeps working. After that your store moves to {next.name}:
        </s-paragraph>
        <Changes changes={notice.changes} />
        <s-button slot="secondary-actions" href="/app/plans">
          Keep {plan.name}
        </s-button>
      </s-banner>
    );
  }

  if (!compact && notice.trialEndsAt && notice.source === "subscription") {
    return (
      <s-banner tone="info" heading={`Your ${plan.name} trial runs until ${day(notice.trialEndsAt)}`}>
        <s-paragraph>
          After that Shopify bills ${plan.monthlyPrice.toFixed(2)} a month on your store invoice. Cancel any time before then and you pay
          nothing.
        </s-paragraph>
      </s-banner>
    );
  }
  return null;
}
