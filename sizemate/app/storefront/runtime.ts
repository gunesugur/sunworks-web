/**
 * Storefront behaviour for one size chart: opening and closing, tabs, unit
 * switching, larger text, the Fit Finder and theme matching. Everything is
 * read from the markup rendered by snippets/sizemate-core.liquid, so there is
 * no network request (except optional anonymous counts for Insights).
 *
 * Built into assets/sizemate-runtime.js, which the small page script
 * (loader.ts) fetches when a shopper first reaches for the size chart.
 *
 * Also used by the admin preview (preview: true), which renders the same
 * Liquid, so what merchants see in the app is what shoppers get.
 */

import { fitColumns, inputUnit, recommendSize, type FitChart, type FitPreference, type FitResult } from "../lib/fit";
import { convertCell, convertValue, displayUnit, formatNumber, isLengthUnit, type LengthUnit, type Unit, type UnitSystem, type WeightUnit } from "../lib/units";
import { applyTheme, ensureReadableAccent } from "./theme";

const SYSTEM_KEY = "sizemate:system";
const LEGACY_UNIT_KEY = "sizemate:unit";
const LARGE_KEY = "sizemate:large";
const INITIALISED = "sizemateReady";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
}

function asSystem(value: string | null | undefined): UnitSystem | null {
  if (value === "metric" || value === "cm") return "metric";
  if (value === "imperial" || value === "in") return "imperial";
  return null;
}

function storedSystem(): UnitSystem | null {
  return asSystem(read(SYSTEM_KEY)) ?? asSystem(read(LEGACY_UNIT_KEY));
}

/* Reading the chart from the table -------------------------------------------- */

function readChart(table: HTMLTableElement, unit: LengthUnit, weightUnit: WeightUnit): FitChart {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const columns = headers.map((th, index) => ({
    id: String(index),
    kind: th.dataset.kind ?? "text",
    label: (th.querySelector(".sizemate-col-label")?.textContent ?? th.textContent ?? "").trim(),
    measure: th.dataset.measure || undefined,
  }));
  const rows = Array.from(table.tBodies[0]?.rows ?? []).map((tr, rowIndex) => ({
    id: String(rowIndex),
    cells: Object.fromEntries(
      Array.from(tr.cells).map((cell, index) => [String(index), (cell.dataset.raw ?? cell.textContent ?? "").trim()]),
    ),
  }));
  return { unit, weightUnit, columns, rows };
}

/* Variant selection ------------------------------------------------------------ */

function findSizeOption(root: HTMLElement, size: string): (() => void) | null {
  const wanted = size.trim().toLowerCase();
  const scope = root.closest(".shopify-section, section, product-info") ?? document;
  for (const input of Array.from(scope.querySelectorAll<HTMLInputElement>("input[type='radio']"))) {
    if (input.closest("[data-sizemate]") || input.value.trim().toLowerCase() !== wanted) continue;
    return () => {
      input.click();
    };
  }
  for (const select of Array.from(scope.querySelectorAll<HTMLSelectElement>("select"))) {
    const option = Array.from(select.options).find((o) => o.value.trim().toLowerCase() === wanted);
    if (!option || select.closest("[data-sizemate]")) continue;
    return () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
  }
  return null;
}

/* Insights ------------------------------------------------------------------------- */

function track(root: HTMLElement, event: "open" | "fit", detail: Record<string, string> = {}): void {
  const endpoint = root.dataset.insights;
  if (!endpoint || root.closest(".sizemate-preview")) return;
  const body = JSON.stringify({ e: event, c: root.dataset.chart ?? "", ...detail });
  try {
    if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: "text/plain" }))) return;
    void fetch(endpoint, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => undefined);
  } catch {
    // Counting is best effort and never affects shoppers.
  }
}

/* One size chart instance ------------------------------------------------------ */

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\[(\w+)\]/g, (match, key: string) => values[key] ?? match);
}

export interface InitOptions {
  /** Admin preview: no dialog, no tracking. */
  preview?: boolean;
  /** Open the chart right away (the first click, handled by the loader). */
  open?: boolean;
  /** Overrides the remembered unit system (admin preview). */
  system?: UnitSystem;
}

export function init(root: HTMLElement, options: InitOptions = {}): void {
  if (root.dataset[INITIALISED]) return;
  root.dataset[INITIALISED] = "true";

  const dialog = root.querySelector<HTMLElement>("[data-sizemate-dialog]");
  const trigger = root.querySelector<HTMLButtonElement>("[data-sizemate-open]");
  const table = root.querySelector<HTMLTableElement>("[data-sizemate-table]");
  if (!dialog || !trigger || !table) return;
  if (options.preview) {
    // The preview shows the window in the page, already open.
    if (dialog instanceof HTMLDialogElement) dialog.setAttribute("open", "");
    else dialog.hidden = false;
  }

  /* Theme */
  const matchTheme = () => {
    applyTheme(root);
    ensureReadableAccent(root);
  };
  matchTheme();
  if (root.dataset.mode === "system" && typeof window.matchMedia === "function") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => ensureReadableAccent(root));
  }

  /* Opening and closing */
  const isDialog = dialog instanceof HTMLDialogElement;
  const open = () => {
    if (options.preview) return;
    matchTheme();
    if (isDialog) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("sizemate-lock");
    } else {
      dialog.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    }
    track(root, "open");
  };
  const close = () => {
    if (isDialog) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    } else {
      dialog.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  };
  trigger.addEventListener("click", () => {
    if (!isDialog && !dialog.hidden) close();
    else open();
  });
  if (isDialog) {
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("sizemate-lock");
      trigger.focus();
    });
  }
  dialog.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    // A click on the dialog itself (not its content) is a click on the backdrop.
    if ((isDialog && target === dialog) || target.closest("[data-sizemate-close]")) close();
  });

  /* Tabs */
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-sizemate-tab]"));
  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-sizemate-panel]"));
  const selectTab = (name: string, focus = false) => {
    for (const tab of tabs) {
      const selected = tab.dataset.sizemateTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    for (const panel of panels) panel.hidden = panel.dataset.sizematePanel !== name;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.sizemateTab!));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        selectTab((event.key === "Home" ? tabs[0] : tabs[tabs.length - 1])!.dataset.sizemateTab!, true);
      } else if (step) {
        event.preventDefault();
        selectTab(tabs[(index + step + tabs.length) % tabs.length]!.dataset.sizemateTab!, true);
      }
    });
  });

  /* Larger text */
  const textSize = root.querySelector<HTMLButtonElement>("[data-sizemate-textsize]");
  const setLarge = (large: boolean) => {
    root.classList.toggle("is-large", large);
    textSize?.setAttribute("aria-pressed", String(large));
  };
  if (textSize) {
    setLarge(!options.preview && read(LARGE_KEY) === "1");
    textSize.addEventListener("click", () => {
      const large = !root.classList.contains("is-large");
      setLarge(large);
      if (!options.preview) write(LARGE_KEY, large ? "1" : "0");
    });
  }

  /* Hover crosshair */
  if (root.hasAttribute("data-crosshair")) {
    let current: { row: Element; col: number } | null = null;
    const clear = () => {
      if (!current) return;
      current.row.classList.remove("is-hover-row");
      for (const cell of Array.from(table.querySelectorAll(".is-hover-col"))) cell.classList.remove("is-hover-col");
      current = null;
    };
    table.addEventListener("pointerover", (event) => {
      const cell = (event.target as Element).closest("td, th");
      if (!cell || !(cell instanceof HTMLTableCellElement) || cell.closest("thead")) return clear();
      const row = cell.parentElement!;
      if (current && current.row === row && current.col === cell.cellIndex) return;
      clear();
      current = { row, col: cell.cellIndex };
      row.classList.add("is-hover-row");
      if (cell.cellIndex > 0) {
        for (const tr of Array.from(table.rows)) tr.cells[cell.cellIndex]?.classList.add("is-hover-col");
      }
    });
    table.addEventListener("pointerleave", clear);
  }

  /* Units */
  const chartUnit: LengthUnit = isLengthUnit(root.dataset.chartUnit) ? root.dataset.chartUnit : "cm";
  const weightUnit: WeightUnit = root.dataset.weightUnit === "lb" ? "lb" : "kg";
  let system: UnitSystem = options.system ?? storedSystem() ?? asSystem(root.dataset.defaultSystem) ?? "metric";

  const fitPanel = root.querySelector<HTMLElement>("[data-sizemate-panel='fit']");
  const t = (key: string) => fitPanel?.dataset[`t${key[0]!.toUpperCase()}${key.slice(1)}`] ?? key;
  const unitText = (unit: Unit | "ft") => root.dataset[`t${unit[0]!.toUpperCase()}${unit.slice(1)}`] || unit;

  const systemButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-sizemate-system]"));
  const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>("td[data-raw]"));
  const unitLabels = Array.from(root.querySelectorAll<HTMLElement>("[data-sizemate-unit-label]"));
  const sourceUnit = (dim: string | undefined): Unit => (dim === "w" ? weightUnit : chartUnit);
  let onSystemChange: (() => void) | null = null;

  const applySystem = (next: UnitSystem) => {
    system = next;
    for (const cell of cells) {
      const from = sourceUnit(cell.dataset.dim);
      const to = displayUnit(from, system);
      cell.textContent = convertCell(cell.dataset.raw ?? "", from, to, { feetInches: to === "in" && cell.dataset.m === "height" });
    }
    for (const label of unitLabels) {
      const to = displayUnit(sourceUnit(label.dataset.dim), system);
      const feet = to === "in" && label.dataset.m === "height";
      label.textContent = feet ? `(${unitText("ft")}/${unitText("in")})` : `(${unitText(to)})`;
    }
    for (const button of systemButtons) button.setAttribute("aria-pressed", String(button.dataset.sizemateSystem === system));
    onSystemChange?.();
  };
  for (const button of systemButtons) {
    button.addEventListener("click", () => {
      const next = asSystem(button.dataset.sizemateSystem) ?? system;
      if (!options.preview) write(SYSTEM_KEY, next);
      applySystem(next);
    });
  }

  /* Fit Finder */
  const form = root.querySelector<HTMLFormElement>("[data-sizemate-fit]");
  const fieldsBox = root.querySelector<HTMLElement>("[data-sizemate-fit-fields]");
  const resultBox = root.querySelector<HTMLElement>("[data-sizemate-fit-result]");
  if (fitPanel && form && fieldsBox && resultBox) {
    const chart = readChart(table, chartUnit, weightUnit);
    const columns = fitColumns(chart);
    // Typed values are kept in centimetres / kilograms so switching units keeps them.
    const values = new Map<string, number>();
    const base = (measure: string): Unit => (inputUnit(chart, measure, "metric") === "kg" ? "kg" : "cm");

    const numberInput = (id: string, name: string, suffix: string, value: number | undefined, step = "0.1") => {
      const wrap = document.createElement("span");
      wrap.className = "sizemate-field-input";
      const input = document.createElement("input");
      input.id = id;
      input.name = name;
      input.type = "number";
      input.inputMode = "decimal";
      input.min = "0";
      input.step = step;
      input.autocomplete = "off";
      if (value !== undefined) input.value = formatNumber(value, "cm");
      const unit = document.createElement("span");
      unit.className = "sizemate-field-suffix";
      unit.setAttribute("aria-hidden", "true");
      unit.textContent = suffix;
      wrap.append(input, unit);
      return { wrap, input };
    };

    const renderFields = () => {
      fieldsBox.replaceChildren(
        ...columns.map((column) => {
          const measure = column.measure!;
          const id = `${root.id}-fit-${measure}`;
          const unit = inputUnit(chart, measure, system);
          const stored = values.get(measure);
          const label = document.createElement("label");
          label.className = "sizemate-field";
          label.htmlFor = id;
          label.append(column.label);
          const group = document.createElement("span");
          group.className = "sizemate-field-inputs";
          if (unit === "in" && measure === "height") {
            // Heights in feet and inches, the way people say them.
            const inches = stored === undefined ? undefined : convertValue(stored, base(measure), "in");
            const feet = inches === undefined ? undefined : Math.floor(inches / 12);
            const rest = inches === undefined || feet === undefined ? undefined : Math.round((inches - feet * 12) * 10) / 10;
            const ft = numberInput(id, `${measure}__ft`, unitText("ft"), feet, "1");
            const inch = numberInput(`${id}-in`, `${measure}__in`, unitText("in"), rest);
            ft.input.setAttribute("aria-label", `${column.label} (${unitText("ft")})`);
            inch.input.setAttribute("aria-label", `${column.label} (${unitText("in")})`);
            group.append(ft.wrap, inch.wrap);
          } else {
            const value = stored === undefined ? undefined : convertValue(stored, base(measure), unit);
            const field = numberInput(id, measure, unitText(unit), value, unit === "mm" ? "1" : "0.1");
            field.input.setAttribute("aria-label", `${column.label} (${unitText(unit)})`);
            group.append(field.wrap);
          }
          label.append(group);
          return label;
        }),
      );
    };

    const collect = (): Record<string, number> => {
      const data = new FormData(form);
      const number = (name: string) => {
        const value = Number.parseFloat(String(data.get(name) ?? "").replace(",", "."));
        return Number.isFinite(value) && value >= 0 ? value : null;
      };
      const measurements: Record<string, number> = {};
      values.clear();
      for (const column of columns) {
        const measure = column.measure!;
        const unit = inputUnit(chart, measure, system);
        let value: number | null;
        if (unit === "in" && measure === "height") {
          const feet = number(`${measure}__ft`);
          const inches = number(`${measure}__in`);
          value = feet === null && inches === null ? null : (feet ?? 0) * 12 + (inches ?? 0);
        } else {
          value = number(measure);
        }
        if (value === null || value <= 0) continue;
        measurements[measure] = value;
        values.set(measure, convertValue(value, unit, base(measure)));
      }
      return measurements;
    };

    const showResult = (result: FitResult | null) => {
      for (const row of Array.from(table.tBodies[0]?.rows ?? [])) row.classList.remove("is-recommended");
      resultBox.classList.toggle("is-error", !result);
      if (!result) {
        resultBox.textContent = t("empty");
        return;
      }
      table.tBodies[0]?.rows[Number(result.rowId)]?.classList.add("is-recommended");
      const words = { size: result.size, other: result.alternative?.size ?? "" };
      const key = result.status === "between" && !result.alternative ? "closest" : result.status;
      const message = document.createElement("span");
      message.className = "sizemate-fit-size";
      message.textContent = fill(t(key), words);
      const details = document.createElement("ul");
      details.className = "sizemate-fit-details";
      for (const detail of result.details) {
        const item = document.createElement("li");
        item.textContent = `${detail.label}: ${t(detail.status)}`;
        details.append(item);
      }
      resultBox.replaceChildren(message, details);
      const select = options.preview ? null : findSizeOption(root, result.size);
      if (select) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sizemate-fit-select";
        button.textContent = fill(t("select"), words);
        button.addEventListener("click", () => {
          select();
          button.textContent = fill(t("selected"), words);
          button.disabled = true;
        });
        resultBox.append(button);
      }
    };

    renderFields();
    onSystemChange = () => {
      collect();
      renderFields();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const preference = (new FormData(form).get("preference") as FitPreference | null) ?? "regular";
      const result = recommendSize(chart, collect(), system, preference);
      showResult(result);
      if (result) track(root, "fit", { s: result.size, st: result.status });
    });
  }

  applySystem(system);
  if (options.open) open();
}
