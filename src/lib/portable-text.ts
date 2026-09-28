import type { Block, Illustration, PortableText } from '@/content/schema';

export type Group =
  | { kind: 'block'; key: string; block: Block }
  | { kind: 'list'; key: string; ordered: boolean; items: Block[] }
  | { kind: 'figure'; key: string; figure: Illustration };

/** Groups consecutive list-item blocks into lists (Portable Text stores them flat). */
export function groupBlocks(blocks: PortableText): Group[] {
  const groups: Group[] = [];
  for (const block of blocks) {
    if (block._type === 'illustration') {
      groups.push({ kind: 'figure', key: block._key, figure: block });
      continue;
    }
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

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

export const slugify = (text: string): string =>
  text
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

/** Plain text of the prose blocks (for word counts). */
export const plainWords = (blocks: PortableText): number =>
  blocks.reduce((n, b) => (b._type === 'block' ? n + b.children.map((c) => c.text).join(' ').split(/\s+/).filter(Boolean).length : n), 0);

export interface Heading {
  key: string;
  id: string;
  text: string;
  level: 2 | 3;
}

/** h2/h3 blocks with unique anchor ids, for in-page navigation. */
export function headings(blocks: PortableText): Heading[] {
  const seen = new Map<string, number>();
  const out: Heading[] = [];
  for (const b of blocks) {
    if (b._type !== 'block' || (b.style !== 'h2' && b.style !== 'h3')) continue;
    const text = b.children.map((c) => c.text).join('');
    const base = slugify(text) || 'bolum';
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ key: b._key, id: n ? `${base}-${n + 1}` : base, text, level: b.style === 'h2' ? 2 : 3 });
  }
  return out;
}
