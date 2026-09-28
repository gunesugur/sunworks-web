/**
 * Tiny authoring helper that turns a markdown-like string into Sanity Portable Text blocks.
 * Only used for local seed content; the output is exactly what Sanity stores, so the
 * same renderer handles both sources.
 *
 * Supported: paragraphs, "## " / "### " headings, "> " quotes, "- " and "1. " lists,
 * inline **strong**, *em*, `code` and [label](href), and "::name | caption" illustrations.
 */
import { ILLUSTRATIONS, type Block, type Illustration } from './schema';

type Span = Block['children'][number];
type MarkDef = Block['markDefs'][number];

type Token = { kind: 'text' | 'strong' | 'em' | 'code'; text: string } | { kind: 'link'; text: string; href: string };

const PAIRS: { open: string; close: string; kind: 'strong' | 'em' | 'code' }[] = [
  { open: '**', close: '**', kind: 'strong' },
  { open: '`', close: '`', kind: 'code' },
  { open: '*', close: '*', kind: 'em' },
];

/** Linear-time tokenizer for **strong**, *em*, `code` and [label](href). */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let buffer = '';
  let i = 0;
  const flush = () => {
    if (buffer) tokens.push({ kind: 'text', text: buffer });
    buffer = '';
  };
  while (i < text.length) {
    const pair = PAIRS.find((p) => text.startsWith(p.open, i));
    if (pair) {
      const end = text.indexOf(pair.close, i + pair.open.length);
      if (end > i + pair.open.length) {
        flush();
        tokens.push({ kind: pair.kind, text: text.slice(i + pair.open.length, end) });
        i = end + pair.close.length;
        continue;
      }
    }
    if (text[i] === '[') {
      const mid = text.indexOf('](', i);
      const close = mid === -1 ? -1 : text.indexOf(')', mid);
      if (mid > i + 1 && close > mid + 2) {
        flush();
        tokens.push({ kind: 'link', text: text.slice(i + 1, mid), href: text.slice(mid + 2, close) });
        i = close + 1;
        continue;
      }
    }
    buffer += text[i];
    i += 1;
  }
  flush();
  return tokens;
}

function parseInline(text: string, blockKey: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  tokenize(text).forEach((tok, i) => {
    const spanKey = `${blockKey}s${i}`;
    if (tok.kind === 'link') {
      const markKey = `${blockKey}m${i}`;
      markDefs.push({ _type: 'link', _key: markKey, href: tok.href });
      children.push({ _type: 'span', _key: spanKey, text: tok.text, marks: [markKey] });
    } else {
      children.push({ _type: 'span', _key: spanKey, text: tok.text, marks: tok.kind === 'text' ? [] : [tok.kind] });
    }
  });
  return { children, markDefs };
}

function lineToBlock(line: string, blockKey: string): Block {
  let style: Block['style'] = 'normal';
  let listItem: Block['listItem'];
  let text = line;
  if (line.startsWith('### ')) {
    style = 'h3';
    text = line.slice(4);
  } else if (line.startsWith('## ')) {
    style = 'h2';
    text = line.slice(3);
  } else if (line.startsWith('> ')) {
    style = 'blockquote';
    text = line.slice(2);
  } else if (line.startsWith('- ')) {
    listItem = 'bullet';
    text = line.slice(2);
  } else if (/^\d+\. /.test(line)) {
    listItem = 'number';
    text = line.slice(line.indexOf(' ') + 1);
  }
  const { children, markDefs } = parseInline(text.trim(), blockKey);
  const block: Block = { _type: 'block', _key: blockKey, style, markDefs, children };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

const isIllustration = (name: string): name is Illustration['name'] => (ILLUSTRATIONS as readonly string[]).includes(name);

function lineToItem(line: string, key: string): Block | Illustration {
  if (!line.startsWith('::')) return lineToBlock(line, key);
  const [name = '', caption] = line.slice(2).split('|').map((p) => p.trim());
  if (!isIllustration(name)) throw new Error(`Unknown illustration "${name}"`);
  return caption ? { _type: 'illustration', _key: key, name, caption } : { _type: 'illustration', _key: key, name };
}

export function pt(prefix: string, source: string): (Block | Illustration)[] {
  const lines: string[] = [];
  for (const para of source.trim().split(/\n\s*\n/)) {
    const rows = para.split('\n').map((r) => r.trim());
    const isList = rows.every((r) => r.startsWith('- ') || /^\d+\. /.test(r));
    if (isList) lines.push(...rows);
    else lines.push(rows.join(' '));
  }
  return lines.map((line, i) => lineToItem(line, `${prefix}${i}`));
}
