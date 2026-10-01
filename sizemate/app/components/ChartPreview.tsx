/**
 * Live preview of what shoppers see. Mirrors the markup of
 * extensions/sizemate-theme/snippets/sizemate-core.liquid and uses the same
 * stylesheet, so the preview and the storefront cannot drift apart visually.
 */
import { useId, useMemo, useState } from "react";

import foot from "../storefront/diagrams/foot.svg?url";
import garment from "../storefront/diagrams/garment.svg?url";
import hand from "../storefront/diagrams/hand.svg?url";
import head from "../storefront/diagrams/head.svg?url";
import legs from "../storefront/diagrams/legs.svg?url";
import pet from "../storefront/diagrams/pet.svg?url";
import torso from "../storefront/diagrams/torso.svg?url";
import { resolveDiagram, type SizeChart } from "../lib/chart";
import { fitColumns, recommendSize, type FitPreference, type FitResult } from "../lib/fit";
import { getMeasure } from "../lib/measures";
import type { AppearanceSettings } from "../lib/settings";
import { convertCell, type Unit } from "../lib/units";

const DIAGRAMS: Record<string, string> = { foot, garment, hand, head, legs, pet, torso };

const MESSAGES = {
  exact: "We recommend size [size].",
  between: "You're between [other] and [size]. We recommend [size].",
  closest: "The closest size is [size].",
  above: "Your measurements are above our largest size. [size] may feel tight.",
  below: "Your measurements are below our smallest size. [size] may feel loose.",
  good: "fits well",
  tight: "may feel tight",
  loose: "may feel loose",
} as const;

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\[(\w+)\]/g, (match, key: string) => values[key] ?? match);
}

function Icon({ icon }: { icon: AppearanceSettings["icon"] }) {
  const common = { className: "sizemate-icon", viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true } as const;
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (icon === "none") return null;
  if (icon === "hanger") {
    return (
      <svg {...common}>
        <path d="M12 7.5V7a2 2 0 1 1 2-2M12 7.5 3.3 14.2a1.5 1.5 0 0 0 .9 2.8h15.6a1.5 1.5 0 0 0 .9-2.8L12 7.5Z" {...stroke} />
      </svg>
    );
  }
  if (icon === "tape") {
    return (
      <svg {...common}>
        <circle cx="10" cy="11" r="7" {...stroke} />
        <circle cx="10" cy="11" r="2" {...stroke} />
        <path d="M10 18h11v-3M14 18v-2M17 18v-2" {...stroke} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2.5" y="7.5" width="19" height="9" rx="1.5" {...stroke} />
      <path d="M6.5 7.5v3M10 7.5v4.5M13.5 7.5v3M17 7.5v4.5" {...stroke} />
    </svg>
  );
}

export interface ChartPreviewProps {
  chart: SizeChart;
  settings: AppearanceSettings;
  fitFinder: boolean;
  branding: boolean;
}

export function ChartPreview({ chart, settings, fitFinder, branding }: ChartPreviewProps) {
  const uid = useId();
  const [unit, setUnit] = useState<Unit>(settings.defaultUnit === "in" ? "in" : chart.unit);
  const [tab, setTab] = useState<"chart" | "guide" | "fit">("chart");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [preference, setPreference] = useState<FitPreference>("regular");
  const [result, setResult] = useState<FitResult | null | undefined>(undefined);

  const hasMeasures = chart.columns.some((c) => c.kind === "measure");
  const guideItems = chart.columns.filter((c) => c.kind === "measure" && c.measure && c.measure !== "other");
  const hasGuide = chart.guide.enabled && (guideItems.length > 0 || chart.guide.text.trim() !== "");
  const fitChart = useMemo(() => ({ unit: chart.unit, columns: chart.columns, rows: chart.rows }), [chart]);
  const fitFields = fitColumns(fitChart);
  const hasFit = fitFinder && chart.fitFinder && hasMeasures && fitFields.length > 0;
  const tabs = [
    { key: "chart" as const, label: "Size chart" },
    ...(hasGuide ? [{ key: "guide" as const, label: "How to measure" }] : []),
    ...(hasFit ? [{ key: "fit" as const, label: "Find my size" }] : []),
  ];
  const activeTab = tabs.some((t) => t.key === tab) ? tab : "chart";
  const diagram = resolveDiagram(chart);
  const label = settings.buttonLabel || "Size chart";
  const style = settings.accentColor ? ({ "--sizemate-accent": settings.accentColor } as React.CSSProperties) : undefined;

  const findSize = (event: React.FormEvent) => {
    event.preventDefault();
    const values: Record<string, number> = {};
    for (const [measure, raw] of Object.entries(measurements)) {
      const value = Number.parseFloat(raw.replace(",", "."));
      if (Number.isFinite(value) && value > 0) values[measure] = value;
    }
    setResult(recommendSize(fitChart, values, unit, preference));
  };

  return (
    <div className={`sizemate sizemate-preview sizemate--align-${settings.alignment}`} style={style}>
      <button type="button" className={`sizemate-trigger sizemate-trigger--${settings.buttonStyle}`} tabIndex={-1}>
        <Icon icon={settings.icon} />
        <span>{label}</span>
      </button>
      <div className={`sizemate-dialog sizemate-dialog--modal`} role="group" aria-label="Preview">
        <div className="sizemate-panel">
          <header className="sizemate-header">
            <h2 className="sizemate-title">{chart.title || "Size chart"}</h2>
          </header>
          {tabs.length > 1 && (
            <div className="sizemate-tabs" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  className="sizemate-tab"
                  aria-selected={activeTab === t.key}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="sizemate-body">
            {activeTab === "chart" && (
              <section className="sizemate-section">
                {hasMeasures && (
                  <div className="sizemate-units" role="group" aria-label="Units">
                    {(["cm", "in"] as const).map((u) => (
                      <button key={u} type="button" className="sizemate-unit-button" aria-pressed={unit === u} onClick={() => setUnit(u)}>
                        {u}
                      </button>
                    ))}
                  </div>
                )}
                <div className="sizemate-table-wrap">
                  <table className="sizemate-table">
                    <thead>
                      <tr>
                        {chart.columns.map((c) => (
                          <th key={c.id} scope="col">
                            {c.label}
                            {c.kind === "measure" && <span className="sizemate-unit"> ({unit})</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chart.rows.map((row) => (
                        <tr key={row.id} className={result && result.rowId === row.id ? "is-recommended" : undefined}>
                          {chart.columns.map((c, index) =>
                            index === 0 ? (
                              <th key={c.id} scope="row">
                                {row.cells[c.id]}
                              </th>
                            ) : (
                              <td key={c.id}>{c.kind === "measure" ? convertCell(row.cells[c.id] ?? "", chart.unit, unit) : row.cells[c.id]}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {chart.note && <p className="sizemate-note">{chart.note}</p>}
              </section>
            )}
            {activeTab === "guide" && (
              <section className="sizemate-section">
                <div className="sizemate-guide">
                  {diagram !== "none" && DIAGRAMS[diagram] && <img className="sizemate-diagram" src={DIAGRAMS[diagram]} alt="" width={200} height={240} />}
                  <div className="sizemate-guide-text">
                    {chart.guide.text && <p>{chart.guide.text}</p>}
                    <dl className="sizemate-howto">
                      {guideItems.map((c) => (
                        <div key={c.id}>
                          <dt>{c.label}</dt>
                          <dd>{getMeasure(c.measure!)?.howTo}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </section>
            )}
            {activeTab === "fit" && (
              <section className="sizemate-section">
                <form className="sizemate-fit" onSubmit={findSize}>
                  <p className="sizemate-fit-intro">Enter your measurements and we&apos;ll suggest a size.</p>
                  <div className="sizemate-fit-fields">
                    {fitFields.map((c) => (
                      <label key={c.id} className="sizemate-field" htmlFor={`${uid}-${c.id}`}>
                        {c.label}
                        <span className="sizemate-field-input">
                          <input
                            id={`${uid}-${c.id}`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.1"
                            value={measurements[c.measure!] ?? ""}
                            onChange={(e) => setMeasurements({ ...measurements, [c.measure!]: e.target.value })}
                          />
                          <span className="sizemate-field-suffix" aria-hidden="true">
                            {unit}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <fieldset className="sizemate-fit-preference">
                    <legend>Preferred fit</legend>
                    {(["snug", "regular", "relaxed"] as const).map((p) => (
                      <label key={p}>
                        <input type="radio" name={`${uid}-preference`} checked={preference === p} onChange={() => setPreference(p)} />{" "}
                        {p[0]!.toUpperCase() + p.slice(1)}
                      </label>
                    ))}
                  </fieldset>
                  <button type="submit" className="sizemate-fit-submit">
                    Find my size
                  </button>
                  {result === null && <div className="sizemate-fit-result is-error">Enter at least one measurement.</div>}
                  {result && (
                    <div className="sizemate-fit-result">
                      <span className="sizemate-fit-size">
                        {fill(MESSAGES[result.status === "between" && !result.alternative ? "closest" : result.status], {
                          size: result.size,
                          other: result.alternative?.size ?? "",
                        })}
                      </span>
                      <ul className="sizemate-fit-details">
                        {result.details.map((d) => (
                          <li key={d.measure}>
                            {d.label}: {MESSAGES[d.status]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </form>
              </section>
            )}
          </div>
          {branding && (
            <footer className="sizemate-footer">
              <span>Powered by Sizemate</span>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
