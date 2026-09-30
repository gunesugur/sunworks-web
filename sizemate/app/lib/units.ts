/**
 * Measurement parsing, conversion and formatting.
 *
 * Chart cells are free text so merchants can type what they are used to
 * ("86", "86-91", "86,5 – 91"). Anything that parses as a number or a range
 * can be converted between centimetres and inches; everything else is shown
 * exactly as typed.
 */

export type Unit = "cm" | "in";

export const UNITS: readonly Unit[] = ["cm", "in"];

export interface Range {
  min: number;
  max: number;
}

const CM_PER_INCH = 2.54;

// A number with an optional decimal part; comma decimals are accepted ("86,5").
const NUMBER = String.raw`\d+(?:[.,]\d+)?`;
// Separators seen in real charts: hyphen, en/em dash, "to", tilde.
const RANGE_RE = new RegExp(
  String.raw`^\s*(${NUMBER})\s*(?:-|–|—|~|to)\s*(${NUMBER})\s*$`,
  "i",
);
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
  return from === "cm" ? value / CM_PER_INCH : value * CM_PER_INCH;
}

export function convertRange(range: Range, from: Unit, to: Unit): Range {
  return { min: convertValue(range.min, from, to), max: convertValue(range.max, from, to) };
}

/** One decimal place, without a trailing ".0". */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatRange(range: Range): string {
  const min = formatNumber(range.min);
  const max = formatNumber(range.max);
  return min === max ? min : `${min}–${max}`;
}

/**
 * Converts a cell for display. Values typed in the chart's own unit are shown
 * untouched (the merchant's formatting wins); converted values are normalised.
 */
export function convertCell(raw: string, from: Unit, to: Unit): string {
  if (from === to) return raw;
  const range = parseMeasurement(raw);
  return range ? formatRange(convertRange(range, from, to)) : raw;
}
