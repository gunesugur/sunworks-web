/**
 * Storefront behaviour for the Sizemate theme extension.
 *
 * Source of assets/sizemate.js (built by scripts/build-storefront.mjs; do not
 * edit the built file). Everything the script needs is read from the markup
 * rendered by snippets/sizemate-core.liquid, so there is no network request.
 */

import { fitColumns, recommendSize, type FitChart, type FitPreference, type FitResult } from "../../../app/lib/fit";
import { convertCell, type Unit } from "../../../app/lib/units";

const UNIT_KEY = "sizemate:unit";
const INITIALISED = "sizemateReady";

function storedUnit(): Unit | null {
  try {
    const value = window.localStorage.getItem(UNIT_KEY);
    return value === "cm" || value === "in" ? value : null;
  } catch {
    return null;
  }
}

function storeUnit(unit: Unit): void {
  try {
    window.localStorage.setItem(UNIT_KEY, unit);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
}

function asUnit(value: string | undefined, fallback: Unit): Unit {
  return value === "cm" || value === "in" ? value : fallback;
}

/* Placement of the app embed ------------------------------------------------ */

const PLACEMENT_TARGETS: Record<string, { selectors: string[]; position: InsertPosition }> = {
  before_buy_buttons: {
    selectors: [".product-form__buttons", "form[action*='/cart/add'] [type='submit'][name='add']", "form[action*='/cart/add']"],
    position: "beforebegin",
  },
  after_variant_picker: {
    selectors: ["variant-selects", "variant-radios", "variant-picker", "[data-variant-picker]", ".product-form__input", "select[name^='options']"],
    position: "afterend",
  },
  after_price: {
    selectors: ["[id^='price-']", ".product__price", ".product-price", ".price", "[data-product-price]"],
    position: "afterend",
  },
};

function findTarget(selectors: string[], last: boolean): Element | null {
  const main = document.querySelector("main") ?? document.body;
  for (const selector of selectors) {
    const matches = Array.from(main.querySelectorAll(selector)).filter(
      (element) => !element.closest("cart-drawer, .cart-drawer, [data-sizemate], dialog"),
    );
    if (matches.length) return last ? matches[matches.length - 1]! : matches[0]!;
  }
  return null;
}

function placeEmbed(root: HTMLElement): void {
  if (document.querySelector("[data-sizemate-source='block']")) {
    // The merchant placed the app block; it takes precedence.
    root.remove();
    return;
  }
  const placement = root.dataset.placement ?? "before_buy_buttons";
  if (placement === "off") return;
  const config = PLACEMENT_TARGETS[placement] ?? PLACEMENT_TARGETS.before_buy_buttons!;
  let target = findTarget(config.selectors, placement === "after_variant_picker");
  let position = config.position;
  if (!target) {
    target = findTarget(PLACEMENT_TARGETS.before_buy_buttons!.selectors, false);
    position = "beforebegin";
  }
  if (!target) return;
  if (target.matches("[type='submit']")) target = target.parentElement ?? target;
  target.insertAdjacentElement(position, root);
  root.hidden = false;
}

/* Reading the chart from the table -------------------------------------------- */

function readChart(table: HTMLTableElement, unit: Unit): FitChart {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []);
  const columns = headers.map((th, index) => {
    const clone = th.cloneNode(true) as HTMLElement;
    clone.querySelector("[data-sizemate-unit-label]")?.remove();
    return {
      id: String(index),
      kind: th.dataset.kind ?? "text",
      label: (clone.textContent ?? "").trim(),
      measure: th.dataset.measure || undefined,
    };
  });
  const rows = Array.from(table.tBodies[0]?.rows ?? []).map((tr, rowIndex) => ({
    id: String(rowIndex),
    cells: Object.fromEntries(
      Array.from(tr.cells).map((cell, index) => [String(index), (cell.dataset.raw ?? cell.textContent ?? "").trim()]),
    ),
  }));
  return { unit, columns, rows };
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

/* One size chart instance ------------------------------------------------------ */

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\[(\w+)\]/g, (match, key: string) => values[key] ?? match);
}

function init(root: HTMLElement): void {
  if (root.dataset[INITIALISED]) return;
  root.dataset[INITIALISED] = "true";

  if (root.dataset.sizemateSource === "embed") placeEmbed(root);
  if (!root.isConnected) return;

  const dialog = root.querySelector<HTMLDialogElement>("[data-sizemate-dialog]");
  const trigger = root.querySelector<HTMLButtonElement>("[data-sizemate-open]");
  const table = root.querySelector<HTMLTableElement>("[data-sizemate-table]");
  if (!dialog || !trigger || !table) return;

  const chartUnit = asUnit(root.dataset.chartUnit, "cm");
  let unit: Unit = storedUnit() ?? asUnit(root.dataset.defaultUnit, chartUnit);

  /* Opening and closing */
  trigger.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  dialog.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    // A click on the dialog itself (not its content) is a click on the backdrop.
    if (target === dialog || target.closest("[data-sizemate-close]")) dialog.close();
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

  /* Units */
  const unitButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-sizemate-unit]"));
  const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>("td[data-raw]"));
  const unitLabels = Array.from(root.querySelectorAll<HTMLElement>("[data-sizemate-unit-label]"));
  const unitText = (u: Unit) => unitButtons.find((b) => b.dataset.sizemateUnit === u)?.textContent?.trim() || u;
  let fitSuffixes: HTMLElement[] = [];

  const applyUnit = (next: Unit) => {
    unit = next;
    for (const cell of cells) cell.textContent = convertCell(cell.dataset.raw ?? "", chartUnit, unit);
    for (const label of unitLabels) label.textContent = `(${unitText(unit)})`;
    for (const suffix of fitSuffixes) suffix.textContent = unitText(unit);
    for (const button of unitButtons) button.setAttribute("aria-pressed", String(button.dataset.sizemateUnit === unit));
  };
  for (const button of unitButtons) {
    button.addEventListener("click", () => {
      const next = asUnit(button.dataset.sizemateUnit, unit);
      storeUnit(next);
      applyUnit(next);
    });
  }

  /* Fit Finder */
  const fitPanel = root.querySelector<HTMLElement>("[data-sizemate-panel='fit']");
  const form = root.querySelector<HTMLFormElement>("[data-sizemate-fit]");
  const fieldsBox = root.querySelector<HTMLElement>("[data-sizemate-fit-fields]");
  const resultBox = root.querySelector<HTMLElement>("[data-sizemate-fit-result]");
  if (fitPanel && form && fieldsBox && resultBox) {
    const chart = readChart(table, chartUnit);
    const columns = fitColumns(chart);
    const t = (key: string) => fitPanel.dataset[`t${key[0]!.toUpperCase()}${key.slice(1)}`] ?? "";

    fieldsBox.replaceChildren(
      ...columns.map((column) => {
        const id = `${root.id}-fit-${column.measure}`;
        const label = document.createElement("label");
        label.className = "sizemate-field";
        label.htmlFor = id;
        label.textContent = column.label;
        const wrap = document.createElement("span");
        wrap.className = "sizemate-field-input";
        const input = document.createElement("input");
        input.id = id;
        input.name = column.measure!;
        input.type = "number";
        input.inputMode = "decimal";
        input.min = "0";
        input.step = "0.1";
        input.autocomplete = "off";
        const suffix = document.createElement("span");
        suffix.className = "sizemate-field-suffix";
        suffix.setAttribute("aria-hidden", "true");
        wrap.append(input, suffix);
        label.append(wrap);
        return label;
      }),
    );
    fitSuffixes = Array.from(fieldsBox.querySelectorAll<HTMLElement>(".sizemate-field-suffix"));

    const showResult = (result: FitResult | null) => {
      for (const row of Array.from(table.tBodies[0]?.rows ?? [])) row.classList.remove("is-recommended");
      resultBox.classList.toggle("is-error", !result);
      if (!result) {
        resultBox.textContent = t("empty");
        return;
      }
      table.tBodies[0]?.rows[Number(result.rowId)]?.classList.add("is-recommended");
      const values = { size: result.size, other: result.alternative?.size ?? "" };
      const key = result.status === "between" && !result.alternative ? "closest" : result.status;
      const message = document.createElement("span");
      message.className = "sizemate-fit-size";
      message.textContent = fill(t(key), values);
      const details = document.createElement("ul");
      details.className = "sizemate-fit-details";
      for (const detail of result.details) {
        const item = document.createElement("li");
        item.textContent = `${detail.label}: ${t(detail.status)}`;
        details.append(item);
      }
      resultBox.replaceChildren(message, details);
      const select = findSizeOption(root, result.size);
      if (select) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sizemate-fit-select";
        button.textContent = fill(t("select"), values);
        button.addEventListener("click", () => {
          select();
          button.textContent = fill(t("selected"), values);
          button.disabled = true;
        });
        resultBox.append(button);
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const measurements: Record<string, number> = {};
      for (const column of columns) {
        const raw = String(data.get(column.measure!) ?? "").replace(",", ".");
        const value = Number.parseFloat(raw);
        if (Number.isFinite(value) && value > 0) measurements[column.measure!] = value;
      }
      const preference = (data.get("preference") as FitPreference | null) ?? "regular";
      showResult(recommendSize(chart, measurements, unit, preference));
    });
  }

  applyUnit(unit);
}

function initAll(scope: ParentNode = document): void {
  for (const root of Array.from(scope.querySelectorAll<HTMLElement>("[data-sizemate]"))) init(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initAll());
} else {
  initAll();
}

// Theme editor: sections are re-rendered in place.
document.addEventListener("shopify:section:load", (event) => initAll(event.target as ParentNode));
