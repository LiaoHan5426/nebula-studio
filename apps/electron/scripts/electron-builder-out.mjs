import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { electronRoot, prepareElectronBuilderOutput } from './pack-output.mjs';

function quoteShellArg(value) {
  if (process.platform === 'win32') {
    if (!/[\s"&<>|^]/.test(value)) {
      return value;
    }
    return `"${value.replaceAll('"', '""')}"`;
  }
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

const outputDir = prepareElectronBuilderOutput();
const command = [
  'vp',
  'exec',
  'electron-builder',
  ...process.argv.slice(2),
  `-c.directories.output=${outputDir}`,
]
  .map((arg) => quoteShellArg(arg))
  .join(' ');

const result = spawnSync(command, {
  cwd: electronRoot,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (result.error) {
  throw result.error;
}

const status = result.status ?? 1;
if (status !== 0) {
  throw new Error(`electron-builder exited with ${status}`);
}

console.log(`Unpack output: ${join(outputDir, 'win-unpacked')}`);
