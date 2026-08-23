import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const expectedLayers = ['apps', 'packages/core', 'packages/platform', 'packages/ui', 'packages/editors', 'packages/low-code', 'packages/testing'];

export async function checkWorkspacePackages(workspaceRoot) {
  const inventory = JSON.parse(readFileSync(join(workspaceRoot, 'configs/package-inventory.json'), 'utf8'));
  const failures = [];
  for (const layer of expectedLayers) if (!existsSync(join(workspaceRoot, layer))) failures.push(`missing layer ${layer}`);
  for (const entry of inventory.packages ?? []) {
    if (!entry.dir || !entry.name) failures.push('package inventory entry missing dir/name');
    else if (!existsSync(join(workspaceRoot, entry.dir, 'package.json'))) failures.push(`inventory package missing: ${entry.name} (${entry.dir})`);
  }
  for (const obsolete of ['packages/features/use-confirm/package.json', 'packages/core/runtime/package.json']) {
    if (existsSync(join(workspaceRoot, obsolete))) failures.push(`obsolete compatibility package remains: ${obsolete}`);
  }
  if (failures.length > 0) {
    console.error(`[nebula-vsh] workspace check failed:\n  - ${failures.join('\n  - ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('[nebula-vsh] workspace package boundaries passed');
}
