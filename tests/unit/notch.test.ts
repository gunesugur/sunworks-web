import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { notchPath } from '../../src/lib/notch';

test('plain rounded rect when there is no notch', () => {
  const d = notchPath(100, 50, 0, 0, 10, 'tr');
  assert.match(d, /^M10 0 L90 0 A10 10 0 0 1 100 10/);
  assert.ok(d.endsWith('Z'));
});

test('top-right notch has convex, concave, convex corners', () => {
  const d = notchPath(400, 300, 100, 80, 20, 'tr');
  assert.ok(d.includes('L280 0 A20 20 0 0 1 300 20'), d);
  assert.ok(d.includes('L300 60 A20 20 0 0 0 320 80'), d);
  assert.ok(d.includes('L380 80 A20 20 0 0 1 400 100'), d);
});

test('mirrored corners flip the sweep once per axis', () => {
  const tl = notchPath(400, 300, 100, 80, 20, 'tl');
  assert.ok(tl.includes('A20 20 0 0 1 100 20') === false);
  assert.ok(tl.includes('L100 60 A20 20 0 0 1 80 80'), tl);
  const bl = notchPath(400, 300, 100, 80, 20, 'bl');
  assert.ok(bl.includes('L100 240 A20 20 0 0 0 80 220'), bl);
});

test('radius is clamped to fit the notch', () => {
  const d = notchPath(400, 300, 30, 30, 50, 'br');
  assert.ok(d.includes('A15 15'), d);
});

test('empty for zero size', () => {
  assert.equal(notchPath(0, 10, 1, 1, 1, 'tr'), '');
});

test('cleanPath maps build paths to public URLs', async () => {
  const { cleanPath } = await import('../../src/i18n/routes');
  assert.equal(cleanPath('/blog.html'), '/blog');
  assert.equal(cleanPath('/index.html'), '/');
  assert.equal(cleanPath('/en.html'), '/en');
  assert.equal(cleanPath('/en/'), '/en');
  assert.equal(cleanPath('/'), '/');
});
