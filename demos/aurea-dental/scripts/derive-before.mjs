// Derives the "before" state of the results slider from result-after.jpg:
// duller, lower contrast, slight yellow cast. Always regenerated (it is derived data).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../src/assets/images/', import.meta.url));

await sharp(`${dir}result-after.jpg`)
  .modulate({ saturation: 0.82, brightness: 0.95 })
  .linear(0.84, 18) // flatten contrast around the mids
  .recomb([
    [1.02, 0.01, 0],
    [0.01, 1.0, 0],
    [0, 0.02, 0.93],
  ]) // warm/yellow cast: pull blue down
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(`${dir}result-before.jpg`);
console.log('write result-before.jpg');
