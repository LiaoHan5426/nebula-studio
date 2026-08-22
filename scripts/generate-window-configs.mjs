/**
 * Generate window configuration from configs/windows.json.
 *
 * Validation and TypeScript generation live in
 * `@nebula-studio-internal/node/window-config`. This script only writes
 * artifacts and formats them.
 *
 * Usage: node scripts/generate-window-configs.mjs
 */

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findMonorepoRoot } from '@nebula-studio-internal/node';
import { writeWindowConfigArtifacts } from '@nebula-studio-internal/node/window-config';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = findMonorepoRoot(join(scriptDir, '..')) || findMonorepoRoot();

if (!rootDir) {
  console.error('Cannot find monorepo root.');
  process.exit(1);
}

console.log('Reading configs/windows.json ...');
console.log('Validating configuration ...');

try {
  const paths = writeWindowConfigArtifacts(rootDir);
  console.log('Validation passed.');
  console.log('Generating TypeScript ...');
  execFileSync(
    'vp',
    ['fmt', paths.windowsOutputPath, paths.apiNamespacesPath, '--write'],
    {
      cwd: rootDir,
      stdio: 'inherit',
    },
  );
  console.log(`Generated: ${paths.windowsOutputPath}`);
  console.log(`Generated: ${paths.apiNamespacesPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
