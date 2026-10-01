/**
 * The measurements a chart column can represent.
 *
 * "body" measurements describe the shopper and can drive the Fit Finder.
 * "garment" measurements describe the product laid flat and are shown only.
 */

export type MeasureKind = "body" | "garment";

export type Diagram = "torso" | "legs" | "foot" | "head" | "hand" | "garment" | "pants" | "pet" | "ring" | "wrist" | "none";

export interface MeasureDefinition {
  key: string;
  label: string;
  kind: MeasureKind;
  diagram: Diagram;
  howTo: string;
  /** Weight measurements convert kg ↔ lb; everything else is a length. */
  dimension?: "weight";
}

export const MEASURES = [
  { key: "bust", label: "Bust", kind: "body", diagram: "torso", howTo: "Measure around the fullest part of your bust, keeping the tape level under your arms." },
  { key: "chest", label: "Chest", kind: "body", diagram: "torso", howTo: "Measure around the fullest part of your chest, just under your armpits, keeping the tape level." },
  { key: "underbust", label: "Underbust", kind: "body", diagram: "torso", howTo: "Measure snugly around your ribcage, directly under your bust." },
  { key: "waist", label: "Waist", kind: "body", diagram: "torso", howTo: "Measure around your natural waistline, the narrowest part of your torso, usually just above the belly button." },
  { key: "hips", label: "Hips", kind: "body", diagram: "torso", howTo: "Stand with your feet together and measure around the fullest part of your hips." },
  { key: "neck", label: "Neck", kind: "body", diagram: "torso", howTo: "Measure around the base of your neck, leaving room for one finger under the tape." },
  { key: "shoulder", label: "Shoulder", kind: "body", diagram: "torso", howTo: "Measure across your back from the edge of one shoulder to the other." },
  { key: "arm", label: "Arm length", kind: "body", diagram: "torso", howTo: "With your arm relaxed, measure from the shoulder seam down to your wrist bone." },
  { key: "inseam", label: "Inseam", kind: "body", diagram: "legs", howTo: "Measure from the top of your inner thigh down to your ankle." },
  { key: "thigh", label: "Thigh", kind: "body", diagram: "legs", howTo: "Measure around the fullest part of your thigh." },
  { key: "height", label: "Height", kind: "body", diagram: "legs", howTo: "Stand straight against a wall without shoes and measure from the floor to the top of the head." },
  { key: "weight", label: "Weight", kind: "body", diagram: "none", howTo: "Weigh yourself without shoes, ideally in the morning.", dimension: "weight" },
  { key: "calf", label: "Calf", kind: "body", diagram: "legs", howTo: "Measure around the widest part of your calf." },
  { key: "foot_length", label: "Foot length", kind: "body", diagram: "foot", howTo: "Stand on paper with your heel against a wall and measure from the wall to the tip of your longest toe." },
  { key: "foot_width", label: "Foot width", kind: "body", diagram: "foot", howTo: "Measure across the widest part of your foot." },
  { key: "head", label: "Head", kind: "body", diagram: "head", howTo: "Measure around your head just above the eyebrows and ears." },
  { key: "hand", label: "Hand", kind: "body", diagram: "hand", howTo: "Measure around your palm at the widest point, excluding the thumb." },
  { key: "wrist", label: "Wrist", kind: "body", diagram: "wrist", howTo: "Wrap the tape snugly around your wrist just below the wrist bone, then add 1–2 cm for comfort." },
  { key: "finger", label: "Finger", kind: "body", diagram: "ring", howTo: "Wrap a strip of paper around the base of your finger, mark where it overlaps and measure the length." },
  { key: "pet_neck", label: "Neck (pet)", kind: "body", diagram: "pet", howTo: "Measure around the base of your pet's neck where the collar sits." },
  { key: "pet_chest", label: "Chest (pet)", kind: "body", diagram: "pet", howTo: "Measure around the widest part of your pet's ribcage, just behind the front legs." },
  { key: "pet_back", label: "Back length (pet)", kind: "body", diagram: "pet", howTo: "Measure from the base of the neck to the base of the tail." },
  { key: "pet_weight", label: "Weight (pet)", kind: "body", diagram: "none", howTo: "Weigh yourself holding your pet, then subtract your own weight.", dimension: "weight" },
  { key: "garment_chest", label: "Chest width (flat)", kind: "garment", diagram: "garment", howTo: "Lay the garment flat and measure straight across, 2.5 cm (1 in) below the armholes." },
  { key: "garment_waist", label: "Waist width (flat)", kind: "garment", diagram: "garment", howTo: "Lay the garment flat and measure straight across the waistband." },
  { key: "garment_length", label: "Body length", kind: "garment", diagram: "garment", howTo: "Lay the garment flat and measure from the highest point of the shoulder to the bottom hem." },
  { key: "sleeve", label: "Sleeve length", kind: "garment", diagram: "garment", howTo: "Measure from the shoulder seam to the end of the sleeve." },
  { key: "garment_shoulder", label: "Shoulder width (flat)", kind: "garment", diagram: "garment", howTo: "Lay the garment flat and measure straight across from one shoulder seam to the other." },
  { key: "garment_hips", label: "Hip width (flat)", kind: "garment", diagram: "pants", howTo: "Lay the trousers flat and measure straight across the widest part of the hips." },
  { key: "garment_inseam", label: "Inside leg (garment)", kind: "garment", diagram: "pants", howTo: "Lay the trousers flat and measure from the crotch seam to the bottom of the leg." },
  { key: "rise", label: "Rise", kind: "garment", diagram: "pants", howTo: "Measure from the crotch seam up to the top of the waistband." },
  { key: "ring_diameter", label: "Inside diameter", kind: "garment", diagram: "ring", howTo: "Measure straight across the inside of a ring that fits you well." },
  { key: "ring_circumference", label: "Inside circumference", kind: "garment", diagram: "ring", howTo: "The distance around the inside of the ring. Compare it with your finger measurement." },
  { key: "other", label: "Other", kind: "garment", diagram: "none", howTo: "" },
] as const satisfies readonly MeasureDefinition[];

export type MeasureKey = (typeof MEASURES)[number]["key"];

const BY_KEY = new Map<string, MeasureDefinition>(MEASURES.map((m) => [m.key, m]));

export function getMeasure(key: string): MeasureDefinition | undefined {
  return BY_KEY.get(key);
}

export function isMeasureKey(key: string): key is MeasureKey {
  return BY_KEY.has(key);
}

export function isWeightMeasure(key: string): boolean {
  return getMeasure(key)?.dimension === "weight";
}

export { isBodyMeasure } from "./measure-kinds";
