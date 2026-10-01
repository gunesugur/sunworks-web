/**
 * Uploads a chart photo to the store's Files (Content › Files) so it is served
 * from Shopify's CDN. Needs the write_files scope.
 */
import { assertNoUserErrors, gql, ShopifyError, type AdminGraphql, type UserError } from "./graphql.server";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const STAGED_UPLOAD = `#graphql
  mutation SizemateStagedUpload($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`;

const FILE_CREATE = `#graphql
  mutation SizemateFileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus }
      userErrors { field message }
    }
  }`;

const FILE_STATUS = `#graphql
  query SizemateFile($id: ID!) {
    node(id: $id) {
      ... on MediaImage { fileStatus image { url } }
    }
  }`;

interface StagedTarget {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
}

export class UploadError extends Error {}

export function checkImage(file: { type: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "Upload a JPG, PNG, WebP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image is larger than 10 MB. Try a smaller one.";
  if (file.size === 0) return "The file is empty.";
  return null;
}

export async function uploadImage(
  admin: AdminGraphql,
  file: File,
  alt: string,
  options: { fetch?: typeof fetch; wait?: (ms: number) => Promise<void>; attempts?: number } = {},
): Promise<{ url: string; alt: string }> {
  const problem = checkImage(file);
  if (problem) throw new UploadError(problem);
  const doFetch = options.fetch ?? fetch;
  const wait = options.wait ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  const staged = await gql<{ stagedUploadsCreate: { stagedTargets: StagedTarget[]; userErrors: UserError[] } }>(admin, STAGED_UPLOAD, {
    input: [{ filename: file.name || "size-chart.jpg", mimeType: file.type, httpMethod: "POST", resource: "IMAGE", fileSize: String(file.size) }],
  });
  assertNoUserErrors(staged.stagedUploadsCreate.userErrors, "Preparing the upload failed");
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new ShopifyError("Shopify didn't return an upload target");

  const form = new FormData();
  for (const { name, value } of target.parameters) form.append(name, value);
  form.append("file", file);
  const response = await doFetch(target.url, { method: "POST", body: form });
  if (!response.ok) throw new UploadError(`The upload failed (${response.status}). Try again.`);

  const created = await gql<{ fileCreate: { files: { id: string }[]; userErrors: UserError[] } }>(admin, FILE_CREATE, {
    files: [{ originalSource: target.resourceUrl, contentType: "IMAGE", alt }],
  });
  assertNoUserErrors(created.fileCreate.userErrors, "Saving the image failed");
  const id = created.fileCreate.files[0]?.id;
  if (!id) throw new ShopifyError("Shopify didn't create the file");

  // Shopify processes images asynchronously; the CDN URL appears when it's ready.
  for (let attempt = 0; attempt < (options.attempts ?? 15); attempt++) {
    const status = await gql<{ node: { fileStatus?: string; image?: { url: string } | null } | null }>(admin, FILE_STATUS, { id });
    if (status.node?.fileStatus === "FAILED") throw new UploadError("Shopify couldn't process this image. Try a different file.");
    if (status.node?.image?.url) return { url: status.node.image.url, alt };
    await wait(800);
  }
  throw new UploadError("Shopify is still processing the image. Try again in a moment.");
}
