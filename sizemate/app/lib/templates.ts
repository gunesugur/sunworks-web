import { createColumn, createRow, emptyAssignment, type ColumnKind, type SizeChart } from "./chart";
import { createId } from "./ids";
import { isBodyMeasure, type MeasureKey } from "./measures";
import type { Unit } from "./units";

/**
 * Ready-made charts. Values are typical body measurements for EU/US sizing,
 * meant as a starting point: merchants should adjust them to their brand.
 */

interface TemplateColumn {
  label: string;
  kind: ColumnKind;
  measure?: MeasureKey;
}

export interface ChartTemplate {
  key: string;
  name: string;
  group: "Clothing" | "Footwear" | "Accessories" | "Kids & pets" | "Start fresh";
  description: string;
  title: string;
  unit: Unit;
  columns: TemplateColumn[];
  rows: string[][];
  note: string;
}

const size: TemplateColumn = { label: "Size", kind: "size" };
const m = (label: string, measure: MeasureKey): TemplateColumn => ({ label, kind: "measure", measure });
const t = (label: string): TemplateColumn => ({ label, kind: "text" });

export const TEMPLATES: readonly ChartTemplate[] = [
  {
    key: "womens-tops",
    name: "Women's tops & dresses",
    group: "Clothing",
    description: "Bust, waist and hips for XS–XXL.",
    title: "Women's size chart",
    unit: "cm",
    columns: [size, m("Bust", "bust"), m("Waist", "waist"), m("Hips", "hips")],
    rows: [
      ["XS", "80–84", "62–66", "86–90"],
      ["S", "84–88", "66–70", "90–94"],
      ["M", "88–92", "70–74", "94–98"],
      ["L", "92–98", "74–80", "98–104"],
      ["XL", "98–104", "80–86", "104–110"],
      ["XXL", "104–110", "86–92", "110–116"],
    ],
    note: "Between sizes? Choose the larger size for a relaxed fit.",
  },
  {
    key: "mens-tops",
    name: "Men's tops & shirts",
    group: "Clothing",
    description: "Chest, waist and neck for XS–XXL.",
    title: "Men's size chart",
    unit: "cm",
    columns: [size, m("Chest", "chest"), m("Waist", "waist"), m("Neck", "neck")],
    rows: [
      ["XS", "80–88", "65–73", "35–36"],
      ["S", "88–96", "73–81", "37–38"],
      ["M", "96–104", "81–89", "39–40"],
      ["L", "104–112", "89–97", "41–42"],
      ["XL", "112–124", "97–109", "43–44"],
      ["XXL", "124–136", "109–121", "45–46"],
    ],
    note: "Between sizes? Choose the larger size for a relaxed fit.",
  },
  {
    key: "bottoms",
    name: "Jeans & trousers",
    group: "Clothing",
    description: "Waist sizes 26–38 with hips and inseam.",
    title: "Trousers size chart",
    unit: "cm",
    columns: [size, m("Waist", "waist"), m("Hips", "hips"), m("Inseam", "inseam")],
    rows: [
      ["26", "66–68", "84–86", "78"],
      ["28", "71–73", "88–90", "79"],
      ["30", "76–78", "93–95", "80"],
      ["32", "81–83", "98–100", "81"],
      ["34", "86–88", "103–105", "82"],
      ["36", "91–93", "108–110", "83"],
      ["38", "97–99", "113–115", "84"],
    ],
    note: "Size is the waist measurement in inches.",
  },
  {
    key: "tshirt-flat",
    name: "T-shirts (garment measurements)",
    group: "Clothing",
    description: "Flat chest width and body length, ideal for print-on-demand.",
    title: "T-shirt measurements",
    unit: "cm",
    columns: [size, m("Chest width", "garment_chest"), m("Body length", "garment_length"), m("Sleeve", "sleeve")],
    rows: [
      ["S", "46", "71", "20"],
      ["M", "51", "74", "21"],
      ["L", "56", "76", "22"],
      ["XL", "61", "79", "23"],
      ["2XL", "66", "81", "24"],
      ["3XL", "71", "84", "25"],
    ],
    note: "Measurements are of the garment laid flat. Tolerance ±2 cm.",
  },
  {
    key: "womens-shoes",
    name: "Women's shoes",
    group: "Footwear",
    description: "EU, US and UK sizes with foot length.",
    title: "Women's shoe sizes",
    unit: "cm",
    columns: [{ label: "EU", kind: "size" }, t("US"), t("UK"), m("Foot length", "foot_length")],
    rows: [
      ["35", "5", "2.5", "22"],
      ["36", "6", "3.5", "22.9"],
      ["37", "6.5", "4", "23.5"],
      ["38", "7.5", "5", "24.1"],
      ["39", "8.5", "6", "24.8"],
      ["40", "9", "6.5", "25.4"],
      ["41", "10", "7.5", "26"],
      ["42", "10.5", "8", "26.7"],
    ],
    note: "Measure your feet in the evening, when they are at their largest.",
  },
  {
    key: "mens-shoes",
    name: "Men's shoes",
    group: "Footwear",
    description: "EU, US and UK sizes with foot length.",
    title: "Men's shoe sizes",
    unit: "cm",
    columns: [{ label: "EU", kind: "size" }, t("US"), t("UK"), m("Foot length", "foot_length")],
    rows: [
      ["40", "7", "6", "25.1"],
      ["41", "8", "7", "25.9"],
      ["42", "8.5", "7.5", "26.7"],
      ["43", "9.5", "8.5", "27.3"],
      ["44", "10.5", "9.5", "28.3"],
      ["45", "11.5", "10.5", "29"],
      ["46", "12", "11", "29.4"],
    ],
    note: "Measure your feet in the evening, when they are at their largest.",
  },
  {
    key: "hats",
    name: "Hats & caps",
    group: "Accessories",
    description: "Head circumference for S–XL.",
    title: "Hat sizes",
    unit: "cm",
    columns: [size, m("Head", "head")],
    rows: [
      ["S", "54–55"],
      ["M", "56–57"],
      ["L", "58–59"],
      ["XL", "60–61"],
    ],
    note: "",
  },
  {
    key: "gloves",
    name: "Gloves",
    group: "Accessories",
    description: "Hand circumference for S–XL.",
    title: "Glove sizes",
    unit: "cm",
    columns: [size, m("Hand", "hand")],
    rows: [
      ["S", "17–19"],
      ["M", "19–21"],
      ["L", "21–23"],
      ["XL", "23–25"],
    ],
    note: "",
  },
  {
    key: "kids",
    name: "Kids' clothing",
    group: "Kids & pets",
    description: "Ages 2–12 by height, chest and waist.",
    title: "Kids' size chart",
    unit: "cm",
    columns: [{ label: "Age", kind: "size" }, m("Height", "height"), m("Chest", "chest"), m("Waist", "waist")],
    rows: [
      ["2–3 Y", "92–98", "52–54", "50–52"],
      ["3–4 Y", "98–104", "54–56", "51–53"],
      ["4–5 Y", "104–110", "56–58", "52–54"],
      ["5–6 Y", "110–116", "58–60", "53–55"],
      ["7–8 Y", "122–128", "62–65", "55–57"],
      ["9–10 Y", "134–140", "67–70", "57–60"],
      ["11–12 Y", "146–152", "73–76", "60–63"],
    ],
    note: "Children grow fast: if in doubt, size up.",
  },
  {
    key: "pets",
    name: "Pet apparel",
    group: "Kids & pets",
    description: "Neck, chest and back length for dogs and cats.",
    title: "Pet size chart",
    unit: "cm",
    columns: [size, m("Neck", "pet_neck"), m("Chest", "pet_chest"), m("Back length", "pet_back")],
    rows: [
      ["XS", "20–25", "30–35", "20"],
      ["S", "25–30", "35–45", "25"],
      ["M", "30–38", "45–55", "30"],
      ["L", "38–45", "55–65", "40"],
      ["XL", "45–55", "65–75", "50"],
    ],
    note: "Chest is the most important measurement for a comfortable fit.",
  },
  {
    key: "blank",
    name: "Blank chart",
    group: "Start fresh",
    description: "Start from an empty table with your own columns.",
    title: "Size chart",
    unit: "cm",
    columns: [size, m("Chest", "chest"), m("Waist", "waist")],
    rows: [["S"], ["M"], ["L"]],
    note: "",
  },
];

export function getTemplate(key: string): ChartTemplate | undefined {
  return TEMPLATES.find((template) => template.key === key);
}

export function chartFromTemplate(template: ChartTemplate): SizeChart {
  const columns = template.columns.map((c) => createColumn(c.kind, c.label, c.measure));
  const rows = template.rows.map((values) =>
    createRow(Object.fromEntries(values.map((value, index) => [columns[index]!.id, value]))),
  );
  const hasBodyMeasure = template.columns.some((c) => c.measure !== undefined && isBodyMeasure(c.measure));
  return {
    id: createId("c"),
    name: template.name,
    title: template.title,
    status: "active",
    category: template.key,
    unit: template.unit,
    columns,
    rows,
    note: template.note,
    guide: { enabled: true, text: "", diagram: "auto" },
    fitFinder: hasBodyMeasure,
    assignment: emptyAssignment("all"),
    translations: {},
  };
}
