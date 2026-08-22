#!/usr/bin/env node
/**
 * A-track §17.14: workspace package counts and known duplicate boot blocks.
 * Regenerates configs/package-inventory.json with --write; otherwise diffs.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = join(root, 'configs/package-inventory.json');
const write = process.argv.includes('--write');

const skipDirNames = new Set([
  '.git',
  '.mf',
  'dev-dist',
  'dist',
  'node_modules',
  'out',
]);

const knownDuplicateBootBlocks = [
  {
    id: 'standalone-boot.ts',
    files: [
      'apps/sub-web/docs/src/boot.ts',
      'apps/sub-web/settings/src/boot.ts',
      'apps/sub-web/integration/src/boot.ts',
      'apps/sub-web/frontend/src/boot.ts',
      'apps/sub-web/login/src/boot.ts',
    ],
    note: 'Five standalone boots still share document CSS + bootMicroApp + assembly. Federation remotes use federation.ts instead.',
  },
  {
    id: 'host-vs-standalone-workspace-login',
    files: [
      'apps/web/src/workspace/bootHostWorkspace.ts',
      'apps/sub-web/frontend/src/boot.ts',
      'apps/web/src/auth/bootHostLogin.ts',
      'apps/sub-web/login/src/boot.ts',
    ],
    note: 'Host bootHost* still near-clones standalone workspace/login. Federation appearance helper was extracted to shell-protocol.',
  },
];

function categoryFor(relDir) {
  if (relDir.startsWith('apps/')) return 'apps';
  if (relDir.startsWith('packages/')) return 'packages';
  if (relDir.startsWith('internal/')) return 'internal';
  if (relDir.startsWith('tools/')) return 'tools';
  return null;
}

function collectPackages() {
  const found = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirNames.has(entry.name)) {
          stack.push(path);
        }
        continue;
      }
      if (entry.name !== 'package.json') {
        continue;
      }
      const relDir = relative(root, dir).replaceAll('\\', '/');
      if (relDir === '') {
        continue;
      }
      const category = categoryFor(`${relDir}/`);
      if (!category) {
        continue;
      }
      const manifest = JSON.parse(readFileSync(path, 'utf8'));
      found.push({
        name: manifest.name ?? relDir,
        dir: relDir,
        category,
      });
    }
  }
  found.sort((a, b) => a.dir.localeCompare(b.dir));
  return found;
}

function buildInventory() {
  const packages = collectPackages();
  const totals = { apps: 0, packages: 0, internal: 0, tools: 0, all: 0 };
  for (const item of packages) {
    totals[item.category] += 1;
    totals.all += 1;
  }
  return {
    schemaVersion: 1,
    totals,
    maxTotals: { ...totals },
    packages,
    knownDuplicateBootBlocks,
    notes: {
      hostGzipBaseline: 'configs/bundle-baseline.json',
      cssNamespace:
        'application id; Host in-memory duplicate rejection; nebula-css-source-report.json',
      cspNonceGateway: 'intentionally not implemented',
    },
  };
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const current = buildInventory();
const failures = [];

for (const block of knownDuplicateBootBlocks) {
  for (const file of block.files) {
    if (!existsSync(join(root, file))) {
      failures.push(`duplicate-boot file missing: ${file}`);
    }
  }
}

const appShellIndex = readFileSync(
  join(root, 'packages/core/app-shell/src/index.ts'),
  'utf8',
);
if (
  appShellIndex.includes("from '@nebula-studio/shell-protocol'") ||
  appShellIndex.includes("from '@nebula-studio/auth-provider")
) {
  failures.push('app-shell must not re-export shell-protocol or auth-provider');
}

if (write) {
  if (existsSync(inventoryPath)) {
    const previous = JSON.parse(readFileSync(inventoryPath, 'utf8'));
    if (previous.maxTotals) {
      current.maxTotals = previous.maxTotals;
    }
  }
  writeFileSync(inventoryPath, stableStringify(current));
  console.log(
    `[check:inventory] wrote ${inventoryPath} (${String(current.totals.all)} workspace packages)`,
  );
} else {
  if (!existsSync(inventoryPath)) {
    failures.push(
      'missing configs/package-inventory.json — run node ./scripts/check-inventory.mjs --write',
    );
  } else {
    const committed = JSON.parse(readFileSync(inventoryPath, 'utf8'));
    const expected = { ...current, maxTotals: committed.maxTotals };
    if (stableStringify(expected) !== stableStringify(committed)) {
      failures.push(
        'configs/package-inventory.json is stale — run node ./scripts/check-inventory.mjs --write',
      );
    }
    for (const key of ['apps', 'packages', 'internal', 'tools', 'all']) {
      const max = committed.maxTotals?.[key] ?? committed.totals?.[key];
      if (typeof max === 'number' && current.totals[key] > max) {
        failures.push(
          `${key} package count ${String(current.totals[key])} exceeds max ${String(max)}`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error('[check:inventory]');
  for (const message of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

if (!write) {
  console.log(
    `[check:inventory] ok (${String(current.totals.all)} workspace packages)`,
  );
}
