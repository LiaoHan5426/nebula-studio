#!/usr/bin/env node
/**
 * Regenerate deterministic artifacts and fail when the checked-in files were stale.
 *
 * Unlike `git diff`, this compares the files immediately before and after generation,
 * so it also works in a developer worktree that contains unrelated changes.
 *
 * Runtime address drift scanning lives in
 * `@nebula-studio-internal/node-kit/runtime-address-drift`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findMonorepoRoot } from '@nebula-studio-internal/node-kit';
import { scanRuntimeAddressDrift } from '@nebula-studio-internal/node-kit/runtime-address-drift';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = findMonorepoRoot(join(scriptDir, '..')) || findMonorepoRoot();

if (!root) {
  console.error('Cannot find monorepo root.');
  process.exit(1);
}

const generatedFiles = [
  join(root, 'packages/core/app-shell/src/common/_generated-windows.ts'),
  join(root, 'packages/contracts/generated/api-namespaces.ts'),
  join(root, 'packages/contracts/generated/openapi.json'),
  join(root, 'packages/contracts/generated/platform-api.ts'),
  join(root, 'packages/contracts/generated/index.ts'),
];

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

const drift = scanRuntimeAddressDrift(root);
if (drift.length > 0) {
  console.error(
    'Runtime addresses must come from configs/environments.json or generated helpers:',
  );
  for (const item of drift) {
    console.error(`  - ${item}`);
  }
  process.exit(1);
}

console.log('Generated files are up to date.');
