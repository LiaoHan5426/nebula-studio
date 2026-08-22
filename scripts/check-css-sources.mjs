#!/usr/bin/env node
/**
 * A-track: Tailwind sources must be per-artifact, never repo-wide packages/apps scans.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const theme = readFileSync(
  join(root, 'tools/tailwindcss/src/theme.css'),
  'utf8',
);
const failures = [];

if (
  theme.includes("@source '../../../packages/'") ||
  theme.includes('@source "../../../packages/"')
) {
  failures.push('theme.css must not @source ../../../packages/');
}
if (
  theme.includes("@source '../../../apps/'") ||
  theme.includes('@source "../../../apps/"')
) {
  failures.push('theme.css must not @source ../../../apps/');
}
if (/@source\s+['"][^'"]*(?:\/packages\/?['"]|\/apps\/?['"])/.test(theme)) {
  failures.push('theme.css still contains a repo-wide @source');
}

if (failures.length) {
  console.error('[check:css-sources]');
  for (const message of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log('[check:css-sources] shared theme.css has no repo-wide @source');
