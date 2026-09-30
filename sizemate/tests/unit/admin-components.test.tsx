// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChartPreview } from "~/components/ChartPreview";
import { TableEditor } from "~/components/TableEditor";
import type { SizeChart } from "~/lib/chart";
import { DEFAULT_SETTINGS } from "~/lib/settings";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

afterEach(cleanup);

const chart = () => chartFromTemplate(getTemplate("womens-tops")!);

describe("ChartPreview", () => {
  it("shows the table and converts units", () => {
    render(<ChartPreview chart={chart()} settings={DEFAULT_SETTINGS} fitFinder branding={false} />);
    expect(screen.getByRole("heading", { name: "Women's size chart" })).toBeTruthy();
    expect(screen.getAllByRole("cell")[0]!.textContent).toBe("80–84");
    fireEvent.click(screen.getByRole("button", { name: "in" }));
    expect(screen.getAllByRole("cell")[0]!.textContent).toBe("31.5–33.1");
  });

  it("recommends a size in the Fit Finder tab", () => {
    render(<ChartPreview chart={chart()} settings={DEFAULT_SETTINGS} fitFinder branding={false} />);
    fireEvent.click(screen.getByRole("tab", { name: "Find my size" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Bust" }), { target: { value: "90" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Waist" }), { target: { value: "72" } });
    fireEvent.click(screen.getByRole("button", { name: "Find my size" }));
    expect(screen.getByText("We recommend size M.")).toBeTruthy();
  });

  it("hides paid features and shows branding on Free", () => {
    render(<ChartPreview chart={chart()} settings={DEFAULT_SETTINGS} fitFinder={false} branding />);
    expect(screen.queryByRole("tab", { name: "Find my size" })).toBeNull();
    expect(screen.getByText("Powered by Sizemate")).toBeTruthy();
  });

  it("uses the button text and style from Appearance", () => {
    const { container } = render(
      <ChartPreview chart={chart()} settings={{ ...DEFAULT_SETTINGS, buttonLabel: "Sizes", buttonStyle: "filled" }} fitFinder branding={false} />,
    );
    const trigger = container.querySelector(".sizemate-trigger")!;
    expect(trigger.textContent).toBe("Sizes");
    expect(trigger.className).toContain("sizemate-trigger--filled");
  });
});

/** Polaris fields expose their value on the element; simulate what the real component does. */
function type(element: Element, value: string) {
  (element as unknown as { value: string }).value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("TableEditor", () => {
  it("edits a cell through the Polaris field", () => {
    const onChange = vi.fn<(chart: SizeChart) => void>();
    const initial = chart();
    const { container } = render(<TableEditor chart={initial} onChange={onChange} />);
    const cell = container.querySelector('s-text-field[data-row-index="0"][data-col-index="1"]')!;
    act(() => type(cell, "81–85"));
    const next = onChange.mock.calls[0]![0];
    expect(next.rows[0]!.cells[initial.columns[1]!.id]).toBe("81–85");
  });

  it("pastes a block from a spreadsheet", () => {
    const onChange = vi.fn<(chart: SizeChart) => void>();
    const initial = chart();
    const { container } = render(<TableEditor chart={initial} onChange={onChange} />);
    const cell = container.querySelector('s-text-field[data-row-index="5"][data-col-index="0"]')!;
    fireEvent.paste(cell, { clipboardData: { getData: () => "XXL\t104\t86\t110\n3XL\t110\t92\t116" } });
    const next = onChange.mock.calls[0]![0];
    expect(next.rows).toHaveLength(7);
    expect(next.rows[6]!.cells[initial.columns[0]!.id]).toBe("3XL");
  });

  it("warns about values that aren't numbers", () => {
    const initial = chart();
    initial.rows[0]!.cells[initial.columns[1]!.id] = "roomy";
    const { container } = render(<TableEditor chart={initial} onChange={() => undefined} />);
    expect(container.querySelector("s-banner")?.getAttribute("heading")).toBe("1 value isn't a number");
    expect(container.querySelector(".sm-grid-invalid s-text-field")?.getAttribute("data-row-index")).toBe("0");
  });
});
