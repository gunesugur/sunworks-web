// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { useInAppLinks } from "~/components/useInAppLinks";

afterEach(cleanup);

function Layout() {
  useInAppLinks();
  return <Outlet />;
}

function renderApp() {
  const Stub = createRoutesStub([
    {
      path: "/app",
      Component: Layout,
      children: [
        {
          path: "charts",
          Component: () => (
            <div>
              <h1>List</h1>
              <s-button href="/app/charts/new">Choose a template</s-button>
              <s-button href="/app/plans" disabled>
                Locked
              </s-button>
              <s-button href="https://admin.shopify.com/x" target="_top">
                External
              </s-button>
            </div>
          ),
        },
        { path: "charts/new", Component: () => <h1>Templates</h1> },
        { path: "plans", Component: () => <h1>Plans</h1> },
      ],
    },
  ]);
  return render(<Stub initialEntries={["/app/charts"]} />);
}

describe("useInAppLinks", () => {
  it("opens /app links on Polaris buttons with the router", async () => {
    renderApp();
    const event = fireEvent.click(screen.getByText("Choose a template"));
    expect(event).toBe(false); // default prevented: no full page load
    expect(await screen.findByRole("heading", { name: "Templates" })).toBeTruthy();
  });

  it("ignores disabled buttons and links with a target", async () => {
    renderApp();
    fireEvent.click(screen.getByText("Locked"));
    expect(fireEvent.click(screen.getByText("External"))).toBe(true);
    expect(screen.getByRole("heading", { name: "List" })).toBeTruthy();
  });

  it("leaves modified clicks to the browser", () => {
    renderApp();
    expect(fireEvent.click(screen.getByText("Choose a template"), { ctrlKey: true })).toBe(true);
  });
});
