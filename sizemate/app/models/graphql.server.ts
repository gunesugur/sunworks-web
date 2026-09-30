/** The part of the Admin API client this app uses; easy to fake in tests. */
export interface AdminGraphql {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
}

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly details: unknown = undefined,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface GraphqlBody<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function gql<T>(admin: AdminGraphql, query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await admin.graphql(query, variables ? { variables } : undefined);
  const body = (await response.json()) as GraphqlBody<T>;
  if (body.errors?.length) {
    throw new ShopifyError(body.errors.map((e) => e.message).join("; "), body.errors);
  }
  if (!body.data) throw new ShopifyError("Shopify returned no data");
  return body.data;
}

export interface UserError {
  field?: string[] | null;
  message: string;
}

export function assertNoUserErrors(errors: UserError[] | undefined, action: string): void {
  if (errors?.length) {
    throw new ShopifyError(`${action}: ${errors.map((e) => e.message).join("; ")}`, errors);
  }
}
