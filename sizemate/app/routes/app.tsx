import type { HeadersFunction, LinksFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { NavMenu } from "@shopify/app-bridge-react";

import adminStyles from "../styles/admin.css?url";
import storefrontStyles from "../../extensions/sizemate-theme/assets/sizemate.css?url";
import { adminContext } from "../models/context.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: storefrontStyles },
  { rel: "stylesheet", href: adminStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await adminContext(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider apiKey={apiKey}>
      <NavMenu>
        <a href="/app" rel="home">
          Home
        </a>
        <a href="/app/charts">Size charts</a>
        <a href="/app/settings">Appearance</a>
        <a href="/app/plans">Plans</a>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
