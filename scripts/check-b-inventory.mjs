#!/usr/bin/env node
/**
 * B-track inventory: CSS entries, storage literals, raw color usage.
 * Regenerates configs/b-track-inventory.json with --write.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = join(root, 'configs/b-track-inventory.json');
const write = process.argv.includes('--write');

const skipDirNames = new Set([
  'node_modules',
  'dist',
  'out',
  'dev-dist',
  '.git',
  '.mf',
  '__tests__',
]);

const colorAllowlist = new Set([
  'packages/styles/src/tokens/root.css',
  'packages/styles/src/tokens/semantic-light.css',
  'packages/styles/src/tokens/semantic-dark.css',
  'packages/ui/tokens/src/types.ts',
  'packages/ui/tokens/src/palette.ts',
  'apps/electron/src/main/modules/AppearanceSettingsModule.ts',
]);

function walkFiles(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirNames.has(entry.name)) {
        walkFiles(path, acc);
      }
      continue;
    }
    if (/\.(ts|tsx|vue|css|mjs|js)$/.test(entry.name)) {
      acc.push(path);
    }
  }
  return acc;
}

function rel(abs) {
  return abs.slice(root.length + 1).replaceAll('\\', '/');
}

const cssEntries = [];
const storageKeys = new Set();
const rawColors = [];

for (const base of ['apps', 'packages']) {
  const files = walkFiles(join(root, base));
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const path = rel(file);
    if (
      source.includes('@nebula-studio/styles/document') ||
      source.includes('@nebula-studio/styles/remote')
    ) {
      cssEntries.push(path);
    }
    for (const match of source.matchAll(
      /(?:localStorage|sessionStorage)\.(?:getItem|setItem)\(\s*['"]([^'"]+)/g,
    )) {
      storageKeys.add(match[1]);
    }
    if (
      /#[0-9a-fA-F]{3,8}\b/.test(source) &&
      !colorAllowlist.has(path) &&
      !path.includes('__tests__') &&
      !path.endsWith('.test.ts')
    ) {
      rawColors.push(path);
    }
  }
}

const current = {
  schemaVersion: 1,
  cssEntries: cssEntries.toSorted(),
  storageKeys: [...storageKeys].toSorted(),
  rawColorFiles: rawColors.toSorted(),
  notes: {
    screenshots: 'CSS variable JSON snapshots live in tokens tests, not PNG',
    themeStorageKey: 'nebula.theme.v1',
  },
};

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

if (write) {
  writeFileSync(inventoryPath, stableStringify(current));
  console.log(`[check:b-inventory] wrote ${inventoryPath}`);
} else {
  if (!existsSync(inventoryPath)) {
    console.error(
      '[check:b-inventory] missing configs/b-track-inventory.json — run with --write',
    );
    process.exit(1);
  }
  const committed = readFileSync(inventoryPath, 'utf8');
  if (committed !== stableStringify(current)) {
    console.error(
      '[check:b-inventory] configs/b-track-inventory.json is stale — run node ./scripts/check-b-inventory.mjs --write',
    );
    process.exit(1);
  }
  console.log('[check:b-inventory] ok');
}
