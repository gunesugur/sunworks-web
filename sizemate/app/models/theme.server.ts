import { gql, type AdminGraphql } from "./graphql.server";

export const EMBED_HANDLE = "sizemate-embed";
export const BLOCK_HANDLE = "size-chart";

const THEME_QUERY = `#graphql
  query SizemateThemeStatus {
    themes(roles: [MAIN], first: 1) {
      nodes {
        id
        name
        files(filenames: ["config/settings_data.json", "templates/product.json"], first: 2) {
          nodes {
            filename
            body { ... on OnlineStoreThemeFileBodyText { content } }
          }
        }
      }
    }
  }`;

export interface ThemeStatus {
  themeName: string | null;
  /** null when it could not be determined. */
  embedEnabled: boolean | null;
  blockOnProductPage: boolean | null;
}

/** Theme JSON files may start with a comment block Shopify adds. */
export function parseThemeJson(content: string): unknown {
  const stripped = content.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "");
  return JSON.parse(stripped) as unknown;
}

interface BlockLike {
  type?: unknown;
  disabled?: unknown;
}

function blockValues(container: unknown): BlockLike[] {
  if (typeof container !== "object" || container === null) return [];
  const blocks = (container as { blocks?: unknown }).blocks;
  return typeof blocks === "object" && blocks !== null ? (Object.values(blocks) as BlockLike[]) : [];
}

const isOurs = (block: BlockLike, handle: string) =>
  typeof block.type === "string" && block.type.startsWith("shopify://apps/") && block.type.includes(`/blocks/${handle}/`);

export function embedEnabledIn(settingsData: unknown): boolean {
  const current = (settingsData as { current?: unknown } | null)?.current;
  return blockValues(current).some((block) => isOurs(block, EMBED_HANDLE) && block.disabled !== true);
}

export function blockInTemplate(template: unknown): boolean {
  const sections = (template as { sections?: unknown } | null)?.sections;
  if (typeof sections !== "object" || sections === null) return false;
  return Object.values(sections).some((section) =>
    blockValues(section).some((block) => isOurs(block, BLOCK_HANDLE) && block.disabled !== true),
  );
}

export async function getThemeStatus(admin: AdminGraphql): Promise<ThemeStatus> {
  try {
    const data = await gql<{
      themes: {
        nodes: { name: string; files: { nodes: { filename: string; body: { content?: string } }[] } }[];
      };
    }>(admin, THEME_QUERY);
    const theme = data.themes.nodes[0];
    if (!theme) return { themeName: null, embedEnabled: null, blockOnProductPage: null };
    const file = (name: string) => theme.files.nodes.find((f) => f.filename === name)?.body.content;
    const read = (name: string, check: (json: unknown) => boolean): boolean | null => {
      const content = file(name);
      if (content === undefined) return null;
      try {
        return check(parseThemeJson(content));
      } catch {
        return null;
      }
    };
    return {
      themeName: theme.name,
      embedEnabled: read("config/settings_data.json", embedEnabledIn),
      blockOnProductPage: read("templates/product.json", blockInTemplate),
    };
  } catch {
    return { themeName: null, embedEnabled: null, blockOnProductPage: null };
  }
}

/** Theme editor deep links: activate the app embed, or add the app block to product pages. */
export function themeEditorLinks(shop: string, apiKey: string) {
  const base = `https://${shop}/admin/themes/current/editor`;
  return {
    activateEmbed: `${base}?context=apps&template=product&activateAppId=${apiKey}/${EMBED_HANDLE}`,
    addBlock: `${base}?template=product&addAppBlockId=${apiKey}/${BLOCK_HANDLE}&target=mainSection`,
    productTemplate: `${base}?template=product`,
  };
}
