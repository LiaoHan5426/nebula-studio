#!/usr/bin/env node
/**
 * Regenerate deterministic artifacts and fail when the checked-in files were stale.
 *
 * Unlike `git diff`, this compares the files immediately before and after generation,
 * so it also works in a developer worktree that contains unrelated changes.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, '..');
const generatedFiles = [
  join(root, 'packages/core/app-shell/src/common/_generated-windows.ts'),
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

console.log('Generated files are up to date.');
