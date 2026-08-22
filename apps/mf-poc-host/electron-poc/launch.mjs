import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const main = join(here, 'main.mjs');
const electronPkg = join(here, '../../../electron/package.json');
const require = createRequire(electronPkg);
const electronBin = require('electron');
const extraArgs = process.argv.slice(2);

const child = spawn(electronBin, [main, ...extraArgs], {
  stdio: 'inherit',
  windowsHide: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
