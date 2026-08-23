#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkWorkspacePackages } from '../src/check-workspace.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = join(packageRoot, '..', '..');
const [command, ...args] = process.argv.slice(2);

const checks = new Map([
  ['check-b-inventory', 'check-b-inventory.mjs'],
  ['check-boundaries', 'check-boundaries.mjs'],
  ['check-bundle', 'check-bundle-budget.mjs'],
  ['check-css-sources', 'check-css-sources.mjs'],
  ['check-docs-mf', 'check-docs-mf.mjs'],
  ['check-editor-boundaries', 'check-editor-boundaries.mjs'],
  ['check-generated', 'check-generated.mjs'],
  ['check-host-workspace', 'check-host-workspace.mjs'],
  ['check-iframe-driver', 'check-iframe-driver.mjs'],
  ['check-integration-mf', 'check-integration-mf.mjs'],
  ['check-inventory', 'check-inventory.mjs'],
  ['check-login-host', 'check-login-host.mjs'],
  ['check-mf-poc', 'check-mf-poc.mjs'],
  ['check-remote-resilience', 'check-remote-resilience.mjs'],
  ['check-settings-mf', 'check-settings-mf.mjs'],
]);

function runCheck(script) {
  const result = spawnSync(process.execPath, [join(packageRoot, 'src', 'checks', script), ...args], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });
  process.exitCode = result.status ?? 1;
}

if (checks.has(command)) {
  runCheck(checks.get(command));
} else switch (command) {
  case 'check-workspace': await checkWorkspacePackages(workspaceRoot); break;
  case 'scan-circular': {
    const { scanCircularDependencies } = await import('../src/check-circular.mjs');
    await scanCircularDependencies(workspaceRoot);
    break;
  }
  default:
    console.error(`Usage: nebula-vsh <${['scan-circular', 'check-workspace', ...checks.keys()].join('|')}>`);
    process.exitCode = 2;
}
