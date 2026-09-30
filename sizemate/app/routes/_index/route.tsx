import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Sizemate: size charts shoppers trust</h1>
        <p className={styles.text}>
          Beautiful size charts, a cm/inch switch and a Fit Finder that recommends the right size. No theme edits.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Ready in minutes</strong>. Start from 10 templates or paste your table from a spreadsheet.
          </li>
          <li>
            <strong>The right chart on every product</strong>. Assign charts by collection, type, vendor, tag or product.
          </li>
          <li>
            <strong>Fewer returns</strong>. The Fit Finder turns shopper measurements into a size recommendation.
          </li>
        </ul>
      </div>
    </div>
  );
}
