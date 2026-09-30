import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  FREE_PRODUCT_LIMIT,
  addToCart,
  bulkReprice,
  canAddProducts,
  cartSummary,
  importRows,
  orderMessage,
  parsePrice,
  parseSheet,
  priceFor,
  product,
  restore,
  seed,
  viewerGroupId,
  whatsappLink,
  type State,
} from '../../src/lib/kartela';

const tr = () => seed('tr');
const p = (s: State, id: string) => {
  const x = product(s, id);
  assert.ok(x, id);
  return x;
};

test('guests see public prices, dealer-only prices stay locked, hidden ones are on request', () => {
  const s = tr();
  assert.deepEqual(priceFor(s, p(s, 'p1'), 'list'), { kind: 'price', value: 145, list: 145, disc: 0 });
  assert.equal(priceFor(s, p(s, 'p3'), 'list').kind, 'locked');
  assert.equal(priceFor(s, p(s, 'p9'), 'list').kind, 'ask');
  assert.equal(priceFor(s, p(s, 'p9'), 'dealer').kind, 'ask');
});

test('a signed-in dealer gets their group discount', () => {
  const s = { ...tr(), viewer: 'DNZ-2041' };
  assert.equal(viewerGroupId(s), 'dealer');
  assert.deepEqual(priceFor(s, p(s, 'p3'), viewerGroupId(s)), { kind: 'price', value: 341, list: 455, disc: 25 });
});

test('Pro-only groups fall back to the dealer group on the free plan', () => {
  const s = { ...tr(), viewer: 'IZM-0877' };
  assert.equal(viewerGroupId(s), 'dealer');
  assert.equal(viewerGroupId({ ...s, plan: 'pro' }), 'key');
});

test('the cart sums whole cases and counts lines on request', () => {
  let s: State = { ...tr(), viewer: 'DNZ-2041' };
  s = addToCart(s, 'p1', 'sand', 2); // 2 × 12 pcs × 109
  s = addToCart(s, 'p1', 'sand', 1); // merges into the same line
  s = addToCart(s, 'p9', 'navy', 1); // price on request
  s = addToCart(s, 'p7', 'grey', 1); // out of stock: ignored
  const sum = cartSummary(s);
  assert.equal(sum.rows.length, 2);
  assert.equal(sum.rows[0]?.cases, 3);
  assert.equal(sum.rows[0]?.pieces, 36);
  assert.equal(sum.total, 36 * 109);
  assert.equal(sum.onRequest, 1);
  assert.equal(sum.cases, 4);
});

test('the WhatsApp message names the dealer, lines and subtotal', () => {
  let s: State = { ...tr(), viewer: 'DNZ-2041' };
  s = addToCart(s, 'p2', 'navy', 1);
  const msg = orderMessage(s);
  assert.match(msg, /Selvi Ev Tekstili kataloğundan/);
  assert.match(msg, /Bayi: Özdemir Tekstil \(DNZ-2041\)/);
  assert.match(msg, /1\) HV-120 Banyo havlusu · Lacivert · 1 koli \(6 adet\)/);
  assert.match(msg, /Ara toplam \(KDV hariç\): ₺1\.440/);
  assert.ok(!/[–—]/.test(msg), 'no dashes in copy');
  assert.equal(whatsappLink('+90 555 000 00 00', 'a b'), 'https://wa.me/905550000000?text=a%20b');
});

test('English demo speaks English', () => {
  const s = addToCart(seed('en'), 'p1', 'white', 1);
  const msg = orderMessage(s);
  assert.match(msg, /Guest buyer/);
  assert.match(msg, /1 case \(12 pcs\)/);
});

test('bulk repricing rounds to the chosen step', () => {
  const out = bulkReprice(tr().products, 8, 5);
  assert.equal(out[0]?.price, 155); // 145 × 1.08 = 156.6 → 155
  assert.equal(out[1]?.price, 345); // 320 × 1.08 = 345.6 → 345
  assert.equal(bulkReprice(tr().products, -100, 5)[0]?.price, 0);
});

test('free plan caps the catalog, Pro does not', () => {
  const s = tr();
  assert.ok(canAddProducts(s, FREE_PRODUCT_LIMIT - s.products.length));
  assert.ok(!canAddProducts(s, FREE_PRODUCT_LIMIT - s.products.length + 1));
  assert.ok(canAddProducts({ ...s, plan: 'pro' }, 500));
});

test('prices typed the Turkish or the English way', () => {
  assert.equal(parsePrice('145'), 145);
  assert.equal(parsePrice('₺1.250'), 1250);
  assert.equal(parsePrice('1.250,50 TL'), 1251);
  assert.equal(parsePrice('1,250.50'), 1251);
  assert.equal(parsePrice('145,90'), 146);
  assert.equal(parsePrice('1.250.000'), 1250000);
  assert.equal(parsePrice('abc'), null);
  assert.equal(parsePrice(''), null);
});

test('rows pasted from a spreadsheet', () => {
  const { rows, errors } = parseSheet('Kod\tÜrün\tFiyat\nhv-900\tYeni havlu\t199\n\nPK-1;Pike;1.100;Pike\nbad line\n');
  assert.deepEqual(rows, [
    { code: 'HV-900', name: 'Yeni havlu', price: 199 },
    { code: 'PK-1', name: 'Pike', price: 1100, cat: 'Pike' },
  ]);
  assert.deepEqual(errors, [5]);
});

test('import updates known codes, adds new ones and respects the free limit', () => {
  const s = tr();
  const rows = [
    { code: 'HV-110', name: 'Pamuk el havlusu', price: 150 },
    ...Array.from({ length: 10 }, (_, i) => ({ code: `YN-${i}`, name: `Ürün ${i}`, price: 100 })),
  ];
  const res = importRows(s, rows);
  assert.equal(res.updated, 1);
  assert.equal(res.added, FREE_PRODUCT_LIMIT - s.products.length);
  assert.equal(res.skipped, 10 - res.added);
  assert.equal(product(res.state, 'p1')?.price, 150);
  assert.equal(importRows({ ...s, plan: 'pro' }, rows).skipped, 0);
});

test('stored state is kept only when it matches the page language and version', () => {
  const s = tr();
  assert.deepEqual(restore(JSON.stringify(s), 'tr'), s);
  assert.equal(restore(JSON.stringify(s), 'en'), null);
  assert.equal(restore('{bad', 'tr'), null);
  assert.equal(restore(JSON.stringify({ ...s, v: 1 }), 'tr'), null);
});
