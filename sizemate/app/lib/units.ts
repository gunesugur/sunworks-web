/**
 * Measurement parsing, conversion and formatting.
 *
 * Chart cells are free text so merchants can type what they are used to
 * ("86", "86-91", "86,5 – 91"). Anything that parses as a number or a range
 * can be converted; everything else is shown exactly as typed.
 *
 * Shoppers switch between two systems: metric (cm, mm, kg) and imperial
 * (in, lb). Each chart stores its lengths in one length unit and its weights
 * in one weight unit.
 */

export type LengthUnit = "cm" | "mm" | "in";
export type WeightUnit = "kg" | "lb";
export type Unit = LengthUnit | WeightUnit;
export type UnitSystem = "metric" | "imperial";
export type Dimension = "length" | "weight";

export const LENGTH_UNITS: readonly LengthUnit[] = ["cm", "mm", "in"];
export const WEIGHT_UNITS: readonly WeightUnit[] = ["kg", "lb"];
/** @deprecated kept for older imports; use LENGTH_UNITS. */
export const UNITS = LENGTH_UNITS;

export interface Range {
  min: number;
  max: number;
}

/** Size of one unit in millimetres (length) or grams (weight). */
const TO_BASE: Record<Unit, number> = { mm: 1, cm: 10, in: 25.4, kg: 1000, lb: 453.59237 };

export function dimensionOf(unit: Unit): Dimension {
  return unit === "kg" || unit === "lb" ? "weight" : "length";
}

export function systemOf(unit: Unit): UnitSystem {
  return unit === "in" || unit === "lb" ? "imperial" : "metric";
}

export function isLengthUnit(value: unknown): value is LengthUnit {
  return value === "cm" || value === "mm" || value === "in";
}

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === "kg" || value === "lb";
}

/**
 * The unit a value is shown in for a shopper's system. Metric keeps the
 * chart's own metric unit (rings stay in mm), imperial uses in / lb.
 */
export function displayUnit(chartUnit: Unit, system: UnitSystem): Unit {
  if (dimensionOf(chartUnit) === "weight") return system === "imperial" ? "lb" : chartUnit === "lb" ? "kg" : chartUnit;
  if (system === "imperial") return "in";
  return chartUnit === "in" ? "cm" : chartUnit;
}

// A number with an optional decimal part; comma decimals are accepted ("86,5").
const NUMBER = String.raw`\d+(?:[.,]\d+)?`;
// Separators seen in real charts: hyphen, en/em dash, "to", tilde.
const RANGE_RE = new RegExp(String.raw`^\s*(${NUMBER})\s*(?:-|–|—|~|to)\s*(${NUMBER})\s*$`, "i");
const SINGLE_RE = new RegExp(String.raw`^\s*(${NUMBER})\s*$`);

function toNumber(text: string): number {
  return Number(text.replace(",", "."));
}

/** Parses "86", "86.5", "86,5", "86-91", "86 – 91", "86 to 91". Returns null for text. */
export function parseMeasurement(raw: string): Range | null {
  if (!raw) return null;
  const range = RANGE_RE.exec(raw);
  if (range) {
    const a = toNumber(range[1]!);
    const b = toNumber(range[2]!);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const single = SINGLE_RE.exec(raw);
  if (single) {
    const value = toNumber(single[1]!);
    return { min: value, max: value };
  }
  return null;
}

export function convertValue(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (dimensionOf(from) !== dimensionOf(to)) throw new Error(`Cannot convert ${from} to ${to}`);
  return (value * TO_BASE[from]) / TO_BASE[to];
}

export function convertRange(range: Range, from: Unit, to: Unit): Range {
  return { min: convertValue(range.min, from, to), max: convertValue(range.max, from, to) };
}

/** Decimal places that read naturally for a unit. */
function decimalsFor(unit: Unit): number {
  return unit === "mm" ? 0 : 1;
}

/** At most one decimal (none for mm), without a trailing ".0". */
export function formatNumber(value: number, unit: Unit = "cm"): string {
  const factor = 10 ** decimalsFor(unit);
  const rounded = Math.round(value * factor) / factor;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimalsFor(unit));
}

export function formatRange(range: Range, unit: Unit = "cm"): string {
  const min = formatNumber(range.min, unit);
  const max = formatNumber(range.max, unit);
  return min === max ? min : `${min}–${max}`;
}

/** 67 in → 5′7″, as people in the US say their height. */
export function formatFeetInches(inches: number): string {
  let feet = Math.floor(inches / 12);
  let rest = Math.round(inches - feet * 12);
  if (rest === 12) {
    feet += 1;
    rest = 0;
  }
  return `${feet}′${rest}″`;
}

/**
 * Converts a cell for display. Values typed in the target unit are shown
 * untouched (the merchant's formatting wins); converted values are normalised.
 * Heights shown in inches can be written in feet and inches.
 */
export function convertCell(raw: string, from: Unit, to: Unit, options: { feetInches?: boolean } = {}): string {
  if (from === to && !options.feetInches) return raw;
  const range = parseMeasurement(raw);
  if (!range) return raw;
  const converted = from === to ? range : convertRange(range, from, to);
  if (options.feetInches && to === "in") {
    const min = formatFeetInches(converted.min);
    const max = formatFeetInches(converted.max);
    return min === max ? min : `${min}–${max}`;
  }
  return from === to ? raw : formatRange(converted, to);
}
