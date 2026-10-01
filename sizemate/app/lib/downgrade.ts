/**
 * What a shop loses when its plan drops (a cancellation, the end of the
 * welcome period). Shown before it happens, in the merchant's own terms:
 * "Fit Finder turns off on 3 charts", not a generic feature list.
 */
import type { SizeChart } from "./chart";
import { chartCount, hasFeature, PLANS, type PlanId } from "./plans";
import { lockedSettingsInUse, type AppearanceSettings } from "./settings";
import { getTemplate, templateAllowed } from "./templates";

export function whatChanges(charts: readonly SizeChart[], settings: AppearanceSettings, from: PlanId, to: PlanId): string[] {
  const changes: string[] = [];
  const lost = (feature: Parameters<typeof hasFeature>[1]) => hasFeature(from, feature) && !hasFeature(to, feature);
  const active = charts.filter((chart) => chart.status === "active");
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  const limit = PLANS[to].chartLimit;
  if (active.length > limit && active.length <= PLANS[from].chartLimit) {
    const paused = active.length - limit;
    changes.push(`${plural(paused, "chart is", "charts are")} paused: ${PLANS[to].name} shows ${chartCount(limit)}. Nothing is deleted.`);
  }
  if (lost("fitFinder")) {
    const withFit = active.filter((chart) => chart.fitFinder).length;
    if (withFit) changes.push(`The Fit Finder turns off on ${plural(withFit, "chart", "charts")}.`);
  }
  if (lost("customStyle") && lockedSettingsInUse(settings, to).length) {
    changes.push("Your custom design switches back to the “Match my theme” style.");
  }
  if (lost("chartImage")) {
    const photos = active.filter((chart) => chart.image).length;
    if (photos) changes.push(`Photo cards are hidden on ${plural(photos, "chart", "charts")}.`);
  }
  if (lost("fitScale")) {
    const scales = active.filter((chart) => chart.fitScale !== null).length;
    if (scales) changes.push(`The fit scale is hidden on ${plural(scales, "chart", "charts")}.`);
  }
  if (lost("removeBranding")) changes.push("“Powered by Sizemate” appears under your charts.");
  if (lost("allTemplates")) {
    const library = active.filter((chart) => {
      const template = getTemplate(chart.category);
      return template && !templateAllowed(to, template);
    }).length;
    if (library) changes.push(`Charts made from library templates keep working; new ones can only use the essentials.`);
  }
  if (lost("translations")) {
    const translated = active.filter((chart) => Object.keys(chart.translations).length > 0).length;
    if (translated) changes.push(`Your translations are hidden on ${plural(translated, "chart", "charts")}.`);
  }
  if (lost("sizeMemory")) changes.push("Returning shoppers no longer see their size on every product.");
  if (lost("insights")) changes.push("Insights stop counting.");
  return changes;
}
