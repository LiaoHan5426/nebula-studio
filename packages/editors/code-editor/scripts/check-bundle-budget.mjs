import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const entry = join(dist, 'index.js');
const entrySource = readFileSync(entry, 'utf8');
const entryGzip = gzipSync(entrySource).length / 1024;
const failures = [];

if (entryGzip > 8) {
  failures.push(`facade entry ${entryGzip.toFixed(2)} KiB gzip > 8 KiB`);
}
if (entrySource.includes('monaco-editor-vue3')) {
  failures.push('facade entry synchronously imports monaco-editor-vue3');
}

const providerBytes = readdirSync(dist)
  .filter((file) => file.startsWith('provider-') && file.endsWith('.js'))
  .reduce((sum, file) => sum + statSync(join(dist, file)).size, 0);
if (providerBytes === 0) failures.push('lazy provider chunk was not emitted');

console.warn(
  `[code-editor-budget] facade ${entryGzip.toFixed(2)} KiB gzip; provider wrappers ${(providerBytes / 1024).toFixed(2)} KiB raw`,
);
if (failures.length) {
  throw new Error(`[code-editor-budget] exceeded:\n- ${failures.join('\n- ')}`);
}
