/**
 * Small helpers around Polaris web components.
 *
 * Polaris fields report their state on the element (value, checked, values),
 * so handlers read it from event.currentTarget.
 */
import { FEATURE_LABELS, planFor, PLANS, type Feature, type PlanId } from "../lib/plans";

type FieldEvent = { currentTarget: EventTarget | null };

export function valueOf(event: FieldEvent): string {
  return String((event.currentTarget as unknown as { value?: string } | null)?.value ?? "");
}

export function checkedOf(event: FieldEvent): boolean {
  return Boolean((event.currentTarget as unknown as { checked?: boolean } | null)?.checked);
}

export function valuesOf(event: FieldEvent): string[] {
  return [...((event.currentTarget as unknown as { values?: string[] } | null)?.values ?? [])];
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  const tone = plan === "plus" ? "success" : plan === "pro" ? "info" : "neutral";
  return <s-badge tone={tone}>{PLANS[plan].name}</s-badge>;
}

/** "Pro" / "Plus" badge next to a locked feature. */
export function FeatureBadge({ feature, plan }: { feature: Feature; plan: PlanId }) {
  const required = planFor(feature);
  if (PLANS[plan].features.includes(feature)) return null;
  return (
    <s-badge tone="info" icon="lock">
      {required.name}
    </s-badge>
  );
}

export function UpgradeCallout({ feature, children }: { feature: Feature; children?: React.ReactNode }) {
  const required = planFor(feature);
  return (
    <s-banner tone="info" heading={`${FEATURE_LABELS[feature]} is on the ${required.name} plan`}>
      {children ?? <s-paragraph>Upgrade to turn it on. You can try it free for 7 days.</s-paragraph>}
      <s-button slot="secondary-actions" href="/app/plans">
        See plans
      </s-button>
    </s-banner>
  );
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "Never";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
