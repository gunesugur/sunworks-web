/**
 * Undo / redo for the chart editor. Consecutive typing in the same field or
 * cell is merged into one step, so one undo reverts a word, not a letter.
 */

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** What the last change edited, for merging (see editKey). */
  lastKey: string | null;
  lastAt: number;
}

export const HISTORY_LIMIT = 100;
/** Edits to the same field closer together than this are one step. */
export const MERGE_WINDOW_MS = 1200;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], lastKey: null, lastAt: 0 };
}

export function push<T>(history: History<T>, next: T, key: string | null, now: number): History<T> {
  if (Object.is(next, history.present)) return history;
  const merge = key !== null && key === history.lastKey && now - history.lastAt < MERGE_WINDOW_MS && history.past.length > 0;
  return {
    past: merge ? history.past : [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    lastKey: key,
    lastAt: now,
  };
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past[history.past.length - 1];
  if (previous === undefined) return history;
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future], lastKey: null, lastAt: 0 };
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future;
  if (next === undefined) return history;
  return { past: [...history.past, history.present], present: next, future: rest, lastKey: null, lastAt: 0 };
}

interface Editable {
  rows?: { id: string; cells: Record<string, string> }[];
  columns?: unknown[];
}

/**
 * Names the single text edit between two versions ("cell:<row>:<col>" or
 * "field:<name>"), or null when the change is structural (rows or columns
 * added, removed or moved), which always gets its own undo step.
 */
export function editKey<T extends object>(before: T, after: T): string | null {
  const changed = (Object.keys(after) as (keyof T)[]).filter((key) => before[key] !== after[key]);
  if (changed.length !== 1) return null;
  const key = changed[0]!;
  const a = before[key];
  const b = after[key];
  if (typeof a === "string" && typeof b === "string") return `field:${String(key)}`;
  if (key === "rows") {
    const rowsA = (before as Editable).rows!;
    const rowsB = (after as Editable).rows!;
    if (rowsA.length !== rowsB.length) return null;
    let found: string | null = null;
    for (let i = 0; i < rowsA.length; i++) {
      const ra = rowsA[i]!;
      const rb = rowsB[i]!;
      if (ra === rb) continue;
      if (ra.id !== rb.id || found) return null;
      const cells = new Set([...Object.keys(ra.cells), ...Object.keys(rb.cells)]);
      const diff = [...cells].filter((c) => ra.cells[c] !== rb.cells[c]);
      if (diff.length !== 1) return null;
      found = `cell:${ra.id}:${diff[0]}`;
    }
    return found;
  }
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null && !Array.isArray(a)) {
    const inner = editKey(a as object, b as object);
    return inner?.startsWith("field:") ? `field:${String(key)}.${inner.slice(6)}` : null;
  }
  return null;
}
