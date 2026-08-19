#!/usr/bin/env node
/**
 * Regenerate deterministic artifacts and fail when the checked-in files were stale.
 *
 * Unlike `git diff`, this compares the files immediately before and after generation,
 * so it also works in a developer worktree that contains unrelated changes.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, '..');
const generatedFiles = [
  join(root, 'packages/core/app-shell/src/common/_generated-windows.ts'),
  join(root, 'packages/contracts/generated/api-namespaces.ts'),
  join(root, 'packages/contracts/generated/openapi.json'),
  join(root, 'packages/contracts/generated/platform-api.ts'),
  join(root, 'packages/contracts/generated/index.ts'),
];

const runtimeAddressPattern =
  /\b(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?|(?:localhost|127\.0\.0\.1):\d+|\b(?:5173|5174|5175|5176|5177|5178|8080|8081|8088|8090)\b)/;
const addressScanRoots = ['apps', 'e2e', 'internal', 'packages', 'playwright.config.ts', 'scripts'];
const addressAllowlist = [
  /^configs[\\/]/,
  /^docs[\\/]/,
  /^node_modules[\\/]/,
  /^packages[\\/]core[\\/]app-shell[\\/]src[\\/]common[\\/]_generated-windows\.ts$/,
  /^packages[\\/]contracts[\\/]generated[\\/]api-namespaces\.ts$/,
  /^packages[\\/]contracts[\\/]generated[\\/]openapi\.json$/,
  /^packages[\\/]contracts[\\/]README\.md$/,
  /^packages[\\/]ui[\\/]nebula-agent[\\/]src[\\/]config[\\/]index\.ts$/,
  /^scripts[\\/]e2e[\\/]run-real-stack\.Tests\.ps1$/,
  /^scripts[\\/]smoke[\\/]/,
  /^scripts[\\/]check-generated\.mjs$/,
];
const ignoredDirectories = new Set([
  '.git',
  'dist',
  'dev-dist',
  'node_modules',
  'out',
  'playwright-report',
  'test-results',
]);
const scannedExtensions = new Set([
  '.cjs',
  '.js',
  '.json',
  '.mjs',
  '.ps1',
  '.ts',
  '.tsx',
  '.vue',
]);

const before = new Map(
  generatedFiles.map((path) => [path, readFileSync(path, 'utf8')]),
);

execFileSync('vp', ['run', 'generate:configs'], {
  cwd: root,
  stdio: 'inherit',
});
execFileSync(
  'node',
  [
    join(root, 'scripts/generate-contracts.mjs'),
    '--file=packages/contracts/generated/openapi.json',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  },
);

const stale = generatedFiles.filter(
  (path) => before.get(path) !== readFileSync(path, 'utf8'),
);

if (stale.length > 0) {
  console.error('Generated files were stale:');
  for (const path of stale) {
    console.error(`  - ${relative(root, path)}`);
  }
  console.error('Commit the regenerated files and run this check again.');
  process.exit(1);
}

const drift = scanRuntimeAddressDrift();
if (drift.length > 0) {
  console.error(
    'Runtime addresses must come from configs/windows.json or generated helpers:',
  );
  for (const item of drift) {
    console.error(`  - ${item}`);
  }
  process.exit(1);
}

console.log('Generated files are up to date.');

function scanRuntimeAddressDrift() {
  const offenders = [];
  for (const entry of addressScanRoots) {
    const absolute = join(root, entry);
    collectOffenders(absolute, offenders);
  }
  return offenders;
}

function collectOffenders(path, offenders) {
  if (!statSync(path, { throwIfNoEntry: false })) return;
  const stat = statSync(path);
  const relativePath = relative(root, path);
  if (addressAllowlist.some((pattern) => pattern.test(relativePath))) return;
  if (stat.isDirectory()) {
    if (ignoredDirectories.has(path.split(/[\\/]/).at(-1))) return;
    for (const child of readdirSync(path)) {
      collectOffenders(join(path, child), offenders);
    }
    return;
  }
  if (!stat.isFile()) return;
  if (!scannedExtensions.has(path.slice(path.lastIndexOf('.')))) return;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (runtimeAddressPattern.test(line)) {
      offenders.push(`${relativePath}:${index + 1}`);
    }
  });
}
