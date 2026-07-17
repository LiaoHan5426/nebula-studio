import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'apps', 'web', 'dist');
const manifestPath = join(distDir, '.vite', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const kib = (bytes) => bytes / 1024;
const gzipKib = (file) =>
  kib(gzipSync(readFileSync(join(distDir, file))).length);

const entry = Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error('[bundle-budget] Vite manifest has no entry chunk');

const syncFiles = new Set();
function collectSync(item) {
  if (!item || syncFiles.has(item.file)) return;
  syncFiles.add(item.file);
  for (const imported of item.imports ?? []) collectSync(manifest[imported]);
}
collectSync(entry);

const initialGzipKib = [...syncFiles].reduce(
  (sum, file) => sum + gzipKib(file),
  0,
);
const failures = [];
if (initialGzipKib > 350) {
  failures.push(
    `initial synchronous JS ${initialGzipKib.toFixed(2)} KiB > 350 KiB`,
  );
}

const budgets = [
  ['integration-domain-', 250],
  ['editor-flow-', 300],
];
const assetFiles = readdirSync(join(distDir, 'assets')).filter((file) =>
  file.endsWith('.js'),
);
for (const [prefix, limit] of budgets) {
  for (const file of assetFiles.filter((candidate) =>
    candidate.startsWith(prefix),
  )) {
    const size = gzipKib(`assets/${file}`);
    if (size > limit)
      failures.push(`${file} ${size.toFixed(2)} KiB > ${limit} KiB`);
  }
}

console.log(
  `[bundle-budget] initial synchronous JS: ${initialGzipKib.toFixed(2)} KiB`,
);
if (failures.length) {
  throw new Error(`[bundle-budget] exceeded:\n- ${failures.join('\n- ')}`);
}
console.log('[bundle-budget] all budgets passed');
