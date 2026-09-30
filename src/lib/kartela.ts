/**
 * Kartela demo: a wholesaler's dealer catalog. Pure state and rules (no DOM), shared by the demo
 * page script and the unit tests. Everything runs in the visitor's browser; nothing is sent anywhere.
 */

export type Lang = 'tr' | 'en';
export type Plan = 'free' | 'pro';
/** Who sees a product's price: everyone, signed-in dealers only, or nobody (price on request). */
export type Visibility = 'all' | 'dealer' | 'hidden';
export type Stock = 'in' | 'low' | 'out';
export type Weave = 'terry' | 'waffle' | 'satin' | 'muslin' | 'percale' | 'pestemal';

export interface Product {
  id: string;
  code: string;
  name: string;
  cat: string;
  size: string;
  /** Pieces per case; dealers order whole cases. */
  pack: number;
  /** List price per piece, VAT excluded, whole liras. */
  price: number;
  vis: Visibility;
  stock: Stock;
  weave: Weave;
  colors: string[];
  isNew?: boolean;
}

export interface Group {
  id: string;
  name: string;
  /** Discount off the list price, percent. */
  disc: number;
  /** The list price itself (guests). */
  base?: boolean;
  /** Only on the Pro plan. */
  pro?: boolean;
}

export interface Dealer {
  name: string;
  code: string;
  group: string;
}

export interface Firm {
  name: string;
  city: string;
  phone: string;
  color: string;
  /** Uploaded logo as a data URL. */
  logo: string | null;
}

export interface CartLine {
  id: string;
  color: string;
  cases: number;
}

export interface State {
  v: 2;
  lang: Lang;
  plan: Plan;
  /** Dealer code of the current viewer, or 'guest'. */
  viewer: string;
  firm: Firm;
  groups: Group[];
  dealers: Dealer[];
  products: Product[];
  /** ISO date the prices were last changed. */
  updated: string;
  cart: CartLine[];
}

export const FREE_PRODUCT_LIMIT = 20;
export const MAX_DISCOUNT = 90;

export const COLORS: Record<string, { hex: string; tr: string; en: string }> = {
  sand: { hex: '#cdb892', tr: 'Kum', en: 'Sand' },
  anthracite: { hex: '#3b4043', tr: 'Antrasit', en: 'Anthracite' },
  sage: { hex: '#8fa38b', tr: 'Adaçayı', en: 'Sage' },
  terracotta: { hex: '#b35a3c', tr: 'Kiremit', en: 'Terracotta' },
  navy: { hex: '#27365a', tr: 'Lacivert', en: 'Navy' },
  ecru: { hex: '#e7dfcb', tr: 'Ekru', en: 'Ecru' },
  blush: { hex: '#ddb3aa', tr: 'Pudra', en: 'Blush' },
  mustard: { hex: '#c99a2e', tr: 'Hardal', en: 'Mustard' },
  white: { hex: '#f2f1ec', tr: 'Beyaz', en: 'White' },
  grey: { hex: '#b9bdbb', tr: 'Açık gri', en: 'Light grey' },
  olive: { hex: '#6b6b3a', tr: 'Zeytin', en: 'Olive' },
  coral: { hex: '#d9735e', tr: 'Mercan', en: 'Coral' },
};

export const colorName = (key: string, lang: Lang) => COLORS[key]?.[lang] ?? key;

type Local = { tr: string; en: string };
const L = (tr: string, en: string): Local => ({ tr, en });

const CATS = {
  towel: L('Havlu', 'Towels'),
  pestemal: L('Peştemal', 'Peshtemals'),
  robe: L('Bornoz', 'Bathrobes'),
  bedding: L('Nevresim', 'Bedding'),
  throw: L('Pike', 'Throws'),
};

const SEED: (Omit<Product, 'name' | 'cat' | 'size'> & { name: Local; cat: keyof typeof CATS; size: Local })[] = [
  { id: 'p1', code: 'HV-110', name: L('Pamuk el havlusu', 'Cotton hand towel'), cat: 'towel', size: L('50×90 cm', '50×90 cm'), pack: 12, price: 145, vis: 'all', stock: 'in', weave: 'terry', colors: ['white', 'sand', 'sage', 'anthracite', 'blush', 'navy'] },
  { id: 'p2', code: 'HV-120', name: L('Banyo havlusu', 'Bath towel'), cat: 'towel', size: L('70×140 cm', '70×140 cm'), pack: 6, price: 320, vis: 'all', stock: 'in', weave: 'terry', colors: ['anthracite', 'white', 'sand', 'terracotta', 'navy'] },
  { id: 'p3', code: 'HV-135', name: L('Bambu banyo havlusu', 'Bamboo bath towel'), cat: 'towel', size: L('80×150 cm', '80×150 cm'), pack: 6, price: 455, vis: 'dealer', stock: 'low', weave: 'terry', colors: ['ecru', 'sage', 'grey', 'olive'], isNew: true },
  { id: 'p4', code: 'HV-140', name: L('Mutfak havlusu, 3’lü', 'Kitchen towels, set of 3'), cat: 'towel', size: L('40×60 cm', '40×60 cm'), pack: 20, price: 110, vis: 'all', stock: 'in', weave: 'waffle', colors: ['ecru', 'mustard', 'terracotta', 'olive'] },
  { id: 'p5', code: 'PS-210', name: L('Hamam peştemali', 'Hammam peshtemal'), cat: 'pestemal', size: L('90×180 cm', '90×180 cm'), pack: 10, price: 260, vis: 'dealer', stock: 'in', weave: 'pestemal', colors: ['navy', 'terracotta', 'sage', 'anthracite', 'coral'] },
  { id: 'p6', code: 'BR-310', name: L('Kapüşonlu bornoz', 'Hooded bathrobe'), cat: 'robe', size: L('S · M · L · XL', 'S · M · L · XL'), pack: 4, price: 890, vis: 'dealer', stock: 'in', weave: 'terry', colors: ['white', 'anthracite', 'blush', 'grey'] },
  { id: 'p7', code: 'BR-320', name: L('Waffle bornoz', 'Waffle bathrobe'), cat: 'robe', size: L('Standart beden', 'One size'), pack: 4, price: 760, vis: 'dealer', stock: 'out', weave: 'waffle', colors: ['ecru', 'grey', 'sage'] },
  { id: 'p8', code: 'NV-410', name: L('Ranforce nevresim takımı', 'Percale duvet set'), cat: 'bedding', size: L('Çift kişilik', 'Double'), pack: 4, price: 1150, vis: 'dealer', stock: 'in', weave: 'percale', colors: ['white', 'grey', 'sage', 'blush', 'navy'] },
  { id: 'p9', code: 'NV-420', name: L('Saten nevresim takımı', 'Satin duvet set'), cat: 'bedding', size: L('Çift kişilik', 'Double'), pack: 4, price: 1690, vis: 'hidden', stock: 'low', weave: 'satin', colors: ['ecru', 'anthracite', 'navy', 'coral'], isNew: true },
  { id: 'p10', code: 'NV-430', name: L('Pamuk nevresim takımı', 'Cotton duvet set'), cat: 'bedding', size: L('Tek kişilik', 'Single'), pack: 4, price: 820, vis: 'dealer', stock: 'in', weave: 'percale', colors: ['white', 'sand', 'sage'] },
  { id: 'p11', code: 'PK-510', name: L('Müslin pike', 'Muslin throw'), cat: 'throw', size: L('200×220 cm', '200×220 cm'), pack: 4, price: 1240, vis: 'all', stock: 'in', weave: 'muslin', colors: ['ecru', 'sage', 'terracotta', 'grey', 'mustard'] },
  { id: 'p12', code: 'PK-520', name: L('Pamuk pike', 'Cotton throw'), cat: 'throw', size: L('160×220 cm', '160×220 cm'), pack: 6, price: 640, vis: 'dealer', stock: 'in', weave: 'waffle', colors: ['white', 'sand', 'grey'] },
];

/** The sample wholesaler the demo opens with. Names, codes and prices are made up. */
export function seed(lang: Lang, today = '2026-10-01'): State {
  return {
    v: 2,
    lang,
    plan: 'free',
    viewer: 'guest',
    firm: {
      name: lang === 'tr' ? 'Selvi Ev Tekstili' : 'Selvi Home Textiles',
      city: lang === 'tr' ? 'Denizli · Örnek firma' : 'Denizli · Sample company',
      phone: '905550000000',
      color: '#0f5c4d',
      logo: null,
    },
    groups: [
      { id: 'list', name: lang === 'tr' ? 'Liste fiyatı' : 'List price', disc: 0, base: true },
      { id: 'dealer', name: lang === 'tr' ? 'Bayi' : 'Dealer', disc: 25 },
      { id: 'key', name: lang === 'tr' ? 'Büyük bayi' : 'Key dealer', disc: 32, pro: true },
      { id: 'special', name: lang === 'tr' ? 'Özel müşteri' : 'Special account', disc: 40, pro: true },
    ],
    dealers: [
      { name: 'Özdemir Tekstil', code: 'DNZ-2041', group: 'dealer' },
      { name: lang === 'tr' ? 'Kaya Çeyiz Evi' : 'Kaya Linen House', code: 'IZM-0877', group: 'key' },
      { name: lang === 'tr' ? 'Mavi Koy Otel Tedarik' : 'Mavi Koy Hotel Supply', code: 'ANT-1190', group: 'special' },
    ],
    products: SEED.map((p) => ({ ...p, name: p.name[lang], cat: CATS[p.cat][lang], size: p.size[lang] })),
    updated: today,
    cart: [],
  };
}

export const isPro = (s: State) => s.plan === 'pro';
export const group = (s: State, id: string) => s.groups.find((g) => g.id === id);
export const product = (s: State, id: string) => s.products.find((p) => p.id === id);
export const dealerByCode = (s: State, code: string) => s.dealers.find((d) => d.code === code.trim().toLocaleUpperCase('tr-TR'));

/** Pro-only groups fall back to the plain dealer group on the free plan. */
export function effectiveGroupId(s: State, id: string): string {
  const g = group(s, id);
  if (!g) return 'list';
  if (g.pro && !isPro(s)) return s.groups.find((x) => !x.base && !x.pro)?.id ?? 'list';
  return g.id;
}

export function viewerGroupId(s: State): string {
  const d = s.viewer === 'guest' ? undefined : dealerByCode(s, s.viewer);
  return d ? effectiveGroupId(s, d.group) : 'list';
}

export type Price = { kind: 'price'; value: number; list: number; disc: number } | { kind: 'locked' } | { kind: 'ask' };

export function priceFor(s: State, p: Product, groupId: string): Price {
  if (p.vis === 'hidden') return { kind: 'ask' };
  const g = group(s, groupId) ?? group(s, 'list');
  if (!g || (p.vis === 'dealer' && g.base)) return { kind: 'locked' };
  return { kind: 'price', value: Math.round(p.price * (1 - g.disc / 100)), list: p.price, disc: g.disc };
}

export interface CartRow {
  index: number;
  product: Product;
  color: string;
  cases: number;
  pieces: number;
  /** Null when the price is not shown to this viewer. */
  total: number | null;
}

export interface CartSummary {
  rows: CartRow[];
  total: number;
  cases: number;
  /** Lines whose price the firm will quote. */
  onRequest: number;
}

export function cartSummary(s: State): CartSummary {
  const gid = viewerGroupId(s);
  const rows: CartRow[] = [];
  let total = 0;
  let cases = 0;
  let onRequest = 0;
  s.cart.forEach((line, index) => {
    const p = product(s, line.id);
    if (!p) return;
    const pr = priceFor(s, p, gid);
    const pieces = line.cases * p.pack;
    const sum = pr.kind === 'price' ? pr.value * pieces : null;
    if (sum === null) onRequest += 1;
    else total += sum;
    cases += line.cases;
    rows.push({ index, product: p, color: line.color, cases: line.cases, pieces, total: sum });
  });
  return { rows, total, cases, onRequest };
}

export function addToCart(s: State, id: string, color: string, cases: number): State {
  const p = product(s, id);
  if (!p || p.stock === 'out' || cases < 1) return s;
  const existing = s.cart.find((l) => l.id === id && l.color === color);
  const cart = existing
    ? s.cart.map((l) => (l === existing ? { ...l, cases: l.cases + cases } : l))
    : [...s.cart, { id, color, cases }];
  return { ...s, cart };
}

export const money = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: 'TRY', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n);

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-');
  return lang === 'tr' ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
}

const WORDS = {
  tr: {
    hello: (firm: string) => `Merhaba, ${firm} kataloğundan sipariş vermek istiyorum.`,
    dealer: 'Bayi',
    guest: 'Misafir müşteri',
    ask: 'fiyat sorulacak',
    qty: (cases: number, pieces: number) => `${cases} koli (${pieces} adet)`,
    subtotal: 'Ara toplam (KDV hariç)',
    onRequest: (n: number) => ` + ${n} kalem fiyat sorulacak`,
  },
  en: {
    hello: (firm: string) => `Hello, I would like to order from the ${firm} catalog.`,
    dealer: 'Dealer',
    guest: 'Guest buyer',
    ask: 'price on request',
    qty: (cases: number, pieces: number) => {
      const unit = cases === 1 ? 'case' : 'cases';
      return `${cases} ${unit} (${pieces} pcs)`;
    },
    subtotal: 'Subtotal (excl. VAT)',
    onRequest: (n: number) => ` + ${n} line(s) on request`,
  },
};

/** The order text that goes to the firm's WhatsApp. */
export function orderMessage(s: State, sum: CartSummary = cartSummary(s)): string {
  const w = WORDS[s.lang];
  const d = s.viewer === 'guest' ? undefined : dealerByCode(s, s.viewer);
  const who = d ? `${w.dealer}: ${d.name} (${d.code})` : w.guest;
  const rows = sum.rows.map((r, i) => {
    const price = r.total === null ? w.ask : money(r.total, s.lang);
    return `${i + 1}) ${r.product.code} ${r.product.name} · ${colorName(r.color, s.lang)} · ${w.qty(r.cases, r.pieces)} · ${price}`;
  });
  const tail = sum.onRequest ? w.onRequest(sum.onRequest) : '';
  return [w.hello(s.firm.name), who, '', ...rows, '', `${w.subtotal}: ${money(sum.total, s.lang)}${tail}`].join('\n');
}

export function whatsappLink(phone: string, text?: string): string {
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${phone.replace(/\D/g, '')}${query}`;
}

/** Changes every list price by `pct` percent, rounded to the nearest `step` liras. */
export function bulkReprice(products: Product[], pct: number, step: number): Product[] {
  const r = step > 0 ? step : 1;
  return products.map((p) => ({ ...p, price: Math.max(0, Math.round((p.price * (1 + pct / 100)) / r) * r) }));
}

export function canAddProducts(s: State, n = 1): boolean {
  return isPro(s) || s.products.length + n <= FREE_PRODUCT_LIMIT;
}

/** "1.250.000" style grouping: every part after the first has exactly three digits. */
function isGrouped(t: string, sep: string): boolean {
  const parts = t.split(sep);
  return parts.length > 1 && parts[0] !== '0' && parts.slice(1).every((p) => p.length === 3);
}

function normalizeNumber(t: string): string {
  const comma = t.lastIndexOf(',');
  const dot = t.lastIndexOf('.');
  if (comma > -1 && dot > -1) {
    return comma > dot ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  }
  if (comma > -1) return isGrouped(t, ',') ? t.replace(/,/g, '') : t.replace(',', '.');
  if (dot > -1 && isGrouped(t, '.')) return t.replace(/\./g, '');
  return t;
}

/**
 * Reads a price typed the Turkish way (1.250,50) or the English way (1,250.50); `₺`, `TL` and
 * spaces are ignored. Returns whole liras, or null when it is not a number.
 */
export function parsePrice(raw: string): number | null {
  const t = normalizeNumber(raw.replace(/[₺\s]|TL|TRY/gi, ''));
  if (!t || !/^[\d.]+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export interface SheetRow {
  code: string;
  name: string;
  price: number;
  cat?: string;
}

/**
 * Rows pasted from Excel or Google Sheets: code, name, price and an optional category per line,
 * separated by tabs, semicolons or commas. A header row and blank lines are skipped.
 */
function separatorOf(line: string): string {
  if (line.includes('\t')) return '\t';
  if (line.includes(';')) return ';';
  return ',';
}

export function parseSheet(text: string): { rows: SheetRow[]; errors: number[] } {
  const rows: SheetRow[] = [];
  const errors: number[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const cells = line.split(separatorOf(line)).map((c) => c.trim());
    const [code = '', name = '', rawPrice = '', cat] = cells;
    const price = parsePrice(rawPrice);
    if (!code || !name || price === null) {
      if (i > 0 || price !== null) errors.push(i + 1);
      return;
    }
    rows.push({ code: code.toLocaleUpperCase('tr-TR'), name, price, ...(cat ? { cat } : {}) });
  });
  return { rows, errors };
}

/** Adds new codes and updates the price (and name) of codes already in the catalog. */
export function importRows(s: State, rows: SheetRow[]): { state: State; added: number; updated: number; skipped: number } {
  const products = s.products.map((p) => ({ ...p }));
  let added = 0;
  let updated = 0;
  let skipped = 0;
  for (const r of rows) {
    const existing = products.find((p) => p.code === r.code);
    if (existing) {
      existing.name = r.name;
      existing.price = r.price;
      if (r.cat) existing.cat = r.cat;
      updated += 1;
      continue;
    }
    if (!isPro(s) && products.length >= FREE_PRODUCT_LIMIT) {
      skipped += 1;
      continue;
    }
    products.push({
      id: `p${products.length + 1}-${r.code}`,
      code: r.code,
      name: r.name,
      cat: r.cat ?? products[0]?.cat ?? (s.lang === 'tr' ? 'Diğer' : 'Other'),
      size: '',
      pack: 1,
      price: r.price,
      vis: 'dealer',
      stock: 'in',
      weave: 'terry',
      colors: ['ecru'],
      isNew: true,
    });
    added += 1;
  }
  return { state: { ...s, products }, added, updated, skipped };
}

/** Keeps a stored demo state only if it has the current shape and language. */
export function restore(raw: string | null, lang: Lang): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<State>;
    if (s.v !== 2 || s.lang !== lang || !Array.isArray(s.products) || !Array.isArray(s.groups) || !s.firm) return null;
    return s as State;
  } catch {
    return null;
  }
}
