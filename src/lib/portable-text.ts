import type { Block, PortableText } from '@/content/schema';

export type Group =
  | { kind: 'block'; key: string; block: Block }
  | { kind: 'list'; key: string; ordered: boolean; items: Block[] };

/** Groups consecutive list-item blocks into lists (Portable Text stores them flat). */
export function groupBlocks(blocks: PortableText): Group[] {
  const groups: Group[] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.listItem) {
      const ordered = block.listItem === 'number';
      if (last?.kind === 'list' && last.ordered === ordered) last.items.push(block);
      else groups.push({ kind: 'list', key: block._key, ordered, items: [block] });
    } else {
      groups.push({ kind: 'block', key: block._key, block });
    }
  }
  return groups;
}

export interface RenderSpan {
  key: string;
  text: string;
  strong: boolean;
  em: boolean;
  code: boolean;
  href: string | undefined;
}

export function spans(block: Block): RenderSpan[] {
  return block.children.map((c) => {
    const linkKey = c.marks.find((m) => block.markDefs.some((d) => d._key === m));
    return {
      key: c._key,
      text: c.text,
      strong: c.marks.includes('strong'),
      em: c.marks.includes('em'),
      code: c.marks.includes('code'),
      href: linkKey ? block.markDefs.find((d) => d._key === linkKey)?.href : undefined,
    };
  });
}

export const plainText = (blocks: PortableText): string =>
  blocks.map((b) => b.children.map((c) => c.text).join('')).join('\n\n');
