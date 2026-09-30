/**
 * CSV import and export for chart tables.
 *
 * Import accepts what spreadsheets actually produce: comma, semicolon (European
 * Excel) or tab separated, quoted cells, a UTF-8 BOM and CRLF line endings.
 */

import { createColumn, createRow, LIMITS, type ChartColumn, type ChartRow, type SizeChart } from "./chart";
import { MEASURES, type MeasureKey } from "./measures";
import { parseMeasurement, type Unit } from "./units";

const SEPARATORS = [",", ";", "\t"] as const;

function detectSeparator(firstLine: string): string {
  let best: string = ",";
  let bestCount = 0;
  for (const separator of SEPARATORS) {
    const count = firstLine.split(separator).length - 1;
    if (count > bestCount) {
      best = separator;
      bestCount = count;
    }
  }
  return best;
}

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
  const separator = detectSeparator(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      quoted = true;
    } else if (char === separator) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
}

function escapeCell(value: string): string {
  // Leading =, +, -, @ would run as a formula in Excel (CSV injection).
  const safe = /^[=+\-@]/.test(value) && !parseMeasurement(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function chartToCsv(chart: SizeChart): string {
  const header = chart.columns.map((c) => (c.kind === "measure" ? `${c.label} (${chart.unit})` : c.label));
  const lines = [header, ...chart.rows.map((row) => chart.columns.map((c) => row.cells[c.id] ?? ""))];
  return lines.map((line) => line.map(escapeCell).join(",")).join("\r\n") + "\r\n";
}

const UNIT_IN_HEADER = /\(\s*(cm|in|inch|inches|")\s*\)\s*$/i;

function guessMeasure(header: string): MeasureKey {
  const text = header.toLowerCase();
  const aliases: [RegExp, MeasureKey][] = [
    [/foot|feet|fuß|pied|\bpie\b|ayak/, "foot_length"],
    [/under ?bust|unterbrust/, "underbust"],
    [/chest width|pit to pit|\bflat\b|breite/, "garment_chest"],
    [/bust|brust|poitrine|göğüs/, "bust"],
    [/chest|pecho/, "chest"],
    [/waist|taille|bund|cintura|\bbel\b/, "waist"],
    [/hip|hüfte|hanche|cadera|kalça/, "hips"],
    [/inseam|inside leg|schrittlänge|entrejambe|iç bacak/, "inseam"],
    [/sleeve|ärmel|manche|\bkol\b/, "sleeve"],
    [/length|länge|longueur|\bboy\b/, "garment_length"],
    [/neck|hals|\bcou\b|boyun/, "neck"],
    [/shoulder|schulter|épaule|omuz/, "shoulder"],
    [/height|körpergröße|altura/, "height"],
    [/head|kopf|tête|\bbaş\b/, "head"],
    [/\bhand|\bmain\b|\bel\b/, "hand"],
    [/thigh|oberschenkel|cuisse|uyluk/, "thigh"],
  ];
  const match = aliases.find(([pattern]) => pattern.test(text));
  if (match) return match[1];
  const exact = MEASURES.find((m) => m.label.toLowerCase() === text);
  return exact ? exact.key : "other";
}

export type CsvImport =
  | { ok: true; columns: ChartColumn[]; rows: ChartRow[]; unit: Unit | null; warnings: string[] }
  | { ok: false; error: string };

export function importCsv(text: string): CsvImport {
  const table = parseCsv(text);
  if (table.length < 2) return { ok: false, error: "The file needs a header row and at least one size." };
  const [header, ...body] = table as [string[], ...string[][]];
  const warnings: string[] = [];
  if (header.length > LIMITS.columns) {
    warnings.push(`Only the first ${LIMITS.columns} columns were imported.`);
  }
  if (body.length > LIMITS.rows) warnings.push(`Only the first ${LIMITS.rows} sizes were imported.`);
  const headers = header.slice(0, LIMITS.columns);
  const rowsIn = body.slice(0, LIMITS.rows);

  let unit: Unit | null = null;
  const columns = headers.map((raw, index) => {
    const unitMatch = UNIT_IN_HEADER.exec(raw);
    const label = raw.replace(UNIT_IN_HEADER, "").trim().slice(0, LIMITS.label) || `Column ${index + 1}`;
    if (index === 0) return createColumn("size", label);
    if (unitMatch && !unit) unit = unitMatch[1]!.toLowerCase() === "cm" ? "cm" : "in";
    const values = rowsIn.map((r) => r[index] ?? "").filter(Boolean);
    const numeric = values.filter((v) => parseMeasurement(v)).length;
    const isMeasure = values.length > 0 && numeric / values.length >= 0.6;
    return isMeasure || unitMatch ? createColumn("measure", label, guessMeasure(label)) : createColumn("text", label);
  });

  const rows = rowsIn
    .filter((r) => (r[0] ?? "").trim() !== "")
    .map((r) => createRow(Object.fromEntries(columns.map((c, i) => [c.id, (r[i] ?? "").slice(0, LIMITS.cell)]))));
  if (!rows.length) return { ok: false, error: "No sizes found. The first column should hold the size names." };
  return { ok: true, columns, rows, unit, warnings };
}
