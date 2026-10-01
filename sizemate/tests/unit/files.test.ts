import { describe, expect, it, vi } from "vitest";

import { checkImage, uploadImage, UploadError } from "~/models/files.server";
import type { AdminGraphql } from "~/models/graphql.server";

function fakeAdmin(responses: unknown[]) {
  const calls: { query: string; variables?: Record<string, unknown> }[] = [];
  const admin: AdminGraphql = {
    graphql: async (query, options) => {
      calls.push({ query, variables: options?.variables });
      return { json: async () => ({ data: responses.shift() }) };
    },
  };
  return { admin, calls };
}

const image = () => new File([new Uint8Array(1000)], "model.jpg", { type: "image/jpeg" });

describe("photo upload", () => {
  it("checks type and size before uploading", () => {
    expect(checkImage({ type: "image/png", size: 10 })).toBeNull();
    expect(checkImage({ type: "application/pdf", size: 10 })).toMatch(/JPG, PNG/);
    expect(checkImage({ type: "image/png", size: 11 * 1024 * 1024 })).toMatch(/10 MB/);
    expect(checkImage({ type: "image/png", size: 0 })).toMatch(/empty/);
  });

  it("stages, uploads, creates the file and waits for its CDN URL", async () => {
    const { admin, calls } = fakeAdmin([
      { stagedUploadsCreate: { stagedTargets: [{ url: "https://upload.example/", resourceUrl: "https://upload.example/r", parameters: [{ name: "key", value: "k" }] }], userErrors: [] } },
      { fileCreate: { files: [{ id: "gid://shopify/MediaImage/1" }], userErrors: [] } },
      { node: { fileStatus: "UPLOADED", image: null } },
      { node: { fileStatus: "READY", image: { url: "https://cdn.shopify.com/s/files/model.jpg" } } },
    ]);
    const fetch = vi.fn(async () => new Response(null, { status: 201 }));
    const result = await uploadImage(admin, image(), "Model", { fetch: fetch as unknown as typeof globalThis.fetch, wait: async () => undefined });
    expect(result).toEqual({ url: "https://cdn.shopify.com/s/files/model.jpg", alt: "Model" });
    expect(fetch).toHaveBeenCalledOnce();
    const body = (fetch.mock.calls[0] as unknown as [string, { body: FormData }])[1].body;
    expect(body.get("key")).toBe("k");
    expect(calls[1]!.variables).toEqual({ files: [{ originalSource: "https://upload.example/r", contentType: "IMAGE", alt: "Model" }] });
  });

  it("reports a failed upload and an image Shopify can't process", async () => {
    const staged = { stagedUploadsCreate: { stagedTargets: [{ url: "https://u/", resourceUrl: "https://u/r", parameters: [] }], userErrors: [] } };
    const failing = fakeAdmin([staged]);
    await expect(
      uploadImage(failing.admin, image(), "", { fetch: (async () => new Response(null, { status: 500 })) as typeof fetch }),
    ).rejects.toBeInstanceOf(UploadError);
    const broken = fakeAdmin([staged, { fileCreate: { files: [{ id: "x" }], userErrors: [] } }, { node: { fileStatus: "FAILED" } }]);
    await expect(
      uploadImage(broken.admin, image(), "", { fetch: (async () => new Response(null, { status: 204 })) as typeof fetch, wait: async () => undefined }),
    ).rejects.toThrow(/couldn't process/);
    await expect(uploadImage(failing.admin, new File([], "x.txt", { type: "text/plain" }), "")).rejects.toThrow(/JPG/);
  });
});
