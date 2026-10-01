/**
 * Body measurements, kept apart from measures.ts so the storefront bundle
 * doesn't carry the admin-only labels and instructions.
 * tests/unit/measures.test.ts checks this list against MEASURES.
 */
export const BODY_MEASURE_KEYS: ReadonlySet<string> = new Set([
  "bust",
  "chest",
  "underbust",
  "waist",
  "hips",
  "neck",
  "shoulder",
  "arm",
  "inseam",
  "thigh",
  "height",
  "weight",
  "calf",
  "wrist",
  "finger",
  "foot_length",
  "foot_width",
  "head",
  "hand",
  "pet_neck",
  "pet_chest",
  "pet_back",
  "pet_weight",
]);

/** Measurements in kg / lb rather than a length. */
export const WEIGHT_MEASURE_KEYS: ReadonlySet<string> = new Set(["weight", "pet_weight"]);

export function isBodyMeasure(key: string): boolean {
  return BODY_MEASURE_KEYS.has(key);
}
