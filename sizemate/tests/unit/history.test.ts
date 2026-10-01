import { describe, expect, it } from "vitest";

import { createRow } from "~/lib/chart";
import { addRow, removeColumn, removeRow, setCell } from "~/lib/editor";
import { createHistory, editKey, HISTORY_LIMIT, MERGE_WINDOW_MS, push, redo, undo } from "~/lib/history";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

const chart = () => chartFromTemplate(getTemplate("womens-tops")!);

describe("undo history", () => {
  it("undoes and redoes a deleted row", () => {
    const start = chart();
    let history = createHistory(start);
    const removed = removeRow(start, start.rows[2]!.id);
    history = push(history, removed, editKey(start, removed), 0);
    expect(history.present.rows).toHaveLength(5);
    history = undo(history);
    expect(history.present).toBe(start);
    history = redo(history);
    expect(history.present).toBe(removed);
  });

  it("undoes a deleted column with its values", () => {
    const start = chart();
    const removed = removeColumn(start, start.columns[2]!.id);
    const history = undo(push(createHistory(start), removed, editKey(start, removed), 0));
    expect(history.present.columns).toHaveLength(4);
    expect(history.present.rows[0]!.cells[start.columns[2]!.id]).toBe("62–66");
  });

  it("merges typing in one cell into one step", () => {
    const start = chart();
    const row = start.rows[0]!.id;
    const col = start.columns[1]!.id;
    let history = createHistory(start);
    let current = start;
    for (const [i, value] of ["8", "80", "80–", "80–8", "80–85"].entries()) {
      const next = setCell(current, row, col, value);
      history = push(history, next, editKey(current, next), i * 100);
      current = next;
    }
    expect(history.past).toHaveLength(1);
    expect(undo(history).present).toBe(start);
  });

  it("keeps separate steps for different cells, pauses and structural edits", () => {
    const start = chart();
    const a = setCell(start, start.rows[0]!.id, start.columns[1]!.id, "1");
    const b = setCell(a, start.rows[1]!.id, start.columns[1]!.id, "2");
    let history = push(createHistory(start), a, editKey(start, a), 0);
    history = push(history, b, editKey(a, b), 100);
    expect(history.past).toHaveLength(2);
    const c = setCell(b, start.rows[1]!.id, start.columns[1]!.id, "23");
    history = push(history, c, editKey(b, c), 100 + MERGE_WINDOW_MS + 1);
    expect(history.past).toHaveLength(3);
    const d = addRow(c);
    expect(editKey(c, d)).toBeNull();
  });

  it("names text field edits, including nested ones", () => {
    const start = chart();
    expect(editKey(start, { ...start, title: "New" })).toBe("field:title");
    expect(editKey(start, { ...start, guide: { ...start.guide, text: "Tip" } })).toBe("field:guide.text");
    expect(editKey(start, { ...start, title: "New", note: "x" })).toBeNull();
    expect(editKey(start, { ...start, rows: [...start.rows, createRow()] })).toBeNull();
  });

  it("clears redo after a new edit and caps its length", () => {
    const start = chart();
    let history = createHistory(start);
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) history = push(history, { ...history.present, name: `n${i}` }, null, i);
    expect(history.past).toHaveLength(HISTORY_LIMIT);
    history = undo(history);
    expect(history.future).toHaveLength(1);
    history = push(history, { ...history.present, name: "other" }, null, 9999);
    expect(history.future).toHaveLength(0);
    expect(undo(createHistory(start)).present).toBe(start);
    expect(redo(createHistory(start)).present).toBe(start);
  });
});
