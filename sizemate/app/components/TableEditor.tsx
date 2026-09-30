import { useRef } from "react";

import { LIMITS, type SizeChart } from "../lib/chart";
import {
  addColumn,
  addRow,
  clipboardGrid,
  moveColumn,
  moveRow,
  pasteGrid,
  removeColumn,
  removeRow,
  renameColumn,
  setCell,
  setColumnType,
  unreadableCells,
} from "../lib/editor";
import { MEASURES, type MeasureKey } from "../lib/measures";
import { valueOf } from "./ui";

const BODY = MEASURES.filter((m) => m.kind === "body" && !m.key.startsWith("pet_"));
const PET = MEASURES.filter((m) => m.key.startsWith("pet_"));
const GARMENT = MEASURES.filter((m) => m.kind === "garment" && m.key !== "other");

function ColumnTypeSelect({ value, label, onChange }: { value: string; label: string; onChange: (value: string) => void }) {
  return (
    <s-select label={`Type of ${label || "column"}`} labelAccessibilityVisibility="exclusive" value={value} onChange={(e) => onChange(valueOf(e))}>
      <s-option-group label="Body measurements">
        {BODY.map((m) => (
          <s-option key={m.key} value={m.key}>
            {m.label}
          </s-option>
        ))}
      </s-option-group>
      <s-option-group label="Garment measurements">
        {GARMENT.map((m) => (
          <s-option key={m.key} value={m.key}>
            {m.label}
          </s-option>
        ))}
      </s-option-group>
      <s-option-group label="Pets">
        {PET.map((m) => (
          <s-option key={m.key} value={m.key}>
            {m.label}
          </s-option>
        ))}
      </s-option-group>
      <s-option-group label="Other">
        <s-option value="other">Other measurement</s-option>
        <s-option value="text">Text (not converted)</s-option>
      </s-option-group>
    </s-select>
  );
}

export function TableEditor({ chart, onChange }: { chart: SizeChart; onChange: (chart: SizeChart) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const problems = unreadableCells(chart);
  const sizeLabel = chart.columns[0]?.label || "Size";

  // Pasting several cells from a spreadsheet fills the table from the focused cell.
  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const grid = clipboardGrid(event.clipboardData.getData("text/plain"));
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-row-index]");
    if (!grid || !cell) return;
    event.preventDefault();
    onChange(pasteGrid(chart, Number(cell.dataset.rowIndex), Number(cell.dataset.colIndex), grid));
  };

  return (
    <s-stack gap="base">
      <div className="sm-grid" ref={gridRef} onPaste={onPaste}>
        <table>
          <thead>
            <tr>
              {chart.columns.map((column, index) => (
                <th key={column.id} scope="col">
                  <s-stack gap="small-200">
                    <s-text-field
                      label={index === 0 ? "Size column name" : `Column ${index + 1} name`}
                      labelAccessibilityVisibility="exclusive"
                      value={column.label}
                      placeholder={index === 0 ? "Size" : "Column name"}
                      onInput={(e) => onChange(renameColumn(chart, column.id, valueOf(e)))}
                    />
                    {index === 0 ? (
                      <s-text color="subdued">Size names</s-text>
                    ) : (
                      <s-stack direction="inline" gap="small-300" alignItems="center">
                        <s-box inlineSize="100%">
                          <ColumnTypeSelect
                            label={column.label}
                            value={column.kind === "measure" ? (column.measure ?? "other") : "text"}
                            onChange={(value) => onChange(setColumnType(chart, column.id, value as "text" | MeasureKey))}
                          />
                        </s-box>
                        <s-button
                          variant="tertiary"
                          icon="arrow-left"
                          accessibilityLabel={`Move ${column.label || "column"} left`}
                          disabled={index <= 1}
                          onClick={() => onChange(moveColumn(chart, column.id, -1))}
                        />
                        <s-button
                          variant="tertiary"
                          icon="arrow-right"
                          accessibilityLabel={`Move ${column.label || "column"} right`}
                          disabled={index === chart.columns.length - 1}
                          onClick={() => onChange(moveColumn(chart, column.id, 1))}
                        />
                        <s-button
                          variant="tertiary"
                          tone="critical"
                          icon="delete"
                          accessibilityLabel={`Remove ${column.label || "column"}`}
                          onClick={() => onChange(removeColumn(chart, column.id))}
                        />
                      </s-stack>
                    )}
                  </s-stack>
                </th>
              ))}
              <th scope="col" className="sm-grid-actions">
                <s-text accessibilityVisibility="exclusive">Row actions</s-text>
              </th>
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {chart.columns.map((column, colIndex) => {
                  const size = row.cells[chart.columns[0]!.id] || `row ${rowIndex + 1}`;
                  const invalid = problems.some((p) => p.rowId === row.id && p.columnId === column.id);
                  return (
                    <td key={column.id} className={invalid ? "sm-grid-invalid" : undefined}>
                      <s-text-field
                        data-row-index={rowIndex}
                        data-col-index={colIndex}
                        label={colIndex === 0 ? `${sizeLabel}, row ${rowIndex + 1}` : `${column.label} for ${size}`}
                        labelAccessibilityVisibility="exclusive"
                        value={row.cells[column.id] ?? ""}
                        placeholder={colIndex === 0 ? "e.g. M" : column.kind === "measure" ? "e.g. 88–92" : ""}
                        onInput={(e) => onChange(setCell(chart, row.id, column.id, valueOf(e)))}
                      />
                    </td>
                  );
                })}
                <td className="sm-grid-actions">
                  <s-stack direction="inline" gap="none">
                    <s-button
                      variant="tertiary"
                      icon="arrow-up"
                      accessibilityLabel={`Move ${row.cells[chart.columns[0]!.id] || "size"} up`}
                      disabled={rowIndex === 0}
                      onClick={() => onChange(moveRow(chart, row.id, -1))}
                    />
                    <s-button
                      variant="tertiary"
                      icon="arrow-down"
                      accessibilityLabel={`Move ${row.cells[chart.columns[0]!.id] || "size"} down`}
                      disabled={rowIndex === chart.rows.length - 1}
                      onClick={() => onChange(moveRow(chart, row.id, 1))}
                    />
                    <s-button
                      variant="tertiary"
                      tone="critical"
                      icon="delete"
                      accessibilityLabel={`Remove ${row.cells[chart.columns[0]!.id] || "size"}`}
                      onClick={() => onChange(removeRow(chart, row.id))}
                    />
                  </s-stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <s-stack direction="inline" gap="base" alignItems="center">
        <s-button icon="plus" onClick={() => onChange(addRow(chart))} disabled={chart.rows.length >= LIMITS.rows}>
          Add size
        </s-button>
        <s-button icon="plus" onClick={() => onChange(addColumn(chart, "measure", "other"))} disabled={chart.columns.length >= LIMITS.columns}>
          Add column
        </s-button>
        <s-text color="subdued">Tip: copy cells from Excel or Google Sheets and paste them into any cell.</s-text>
      </s-stack>

      {problems.length > 0 && (
        <s-banner tone="warning" heading={`${problems.length} ${problems.length === 1 ? "value isn't" : "values aren't"} a number`}>
          <s-paragraph>
            These won&apos;t switch between cm and inches or count for the Fit Finder:{" "}
            {problems
              .slice(0, 5)
              .map((p) => `${p.column} for ${p.size || "an unnamed size"}`)
              .join(", ")}
            {problems.length > 5 ? "…" : ""}. Use a number like 88 or a range like 88–92.
          </s-paragraph>
        </s-banner>
      )}
    </s-stack>
  );
}
