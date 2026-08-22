import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolvePocFile,
  rewriteFederationPublicPath,
} from '../apps/mf-poc-host/electron-poc/poc-protocol.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const marker = 'NEBULA_POC_DESIGNER_ONLY';

function run(filter, script) {
  const result = spawnSync('vp', ['run', '--filter', filter, script], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function collectFiles(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(next, files);
    } else {
      files.push(next);
    }
  }
  return files;
}

run('@nebula-studio-internal/vite', 'test');
run('@nebula-studio-renderer/hello', 'build');
run('@nebula-studio-renderer/hello-style-b', 'build');
run('@nebula-studio-renderer/hello-dual', 'build');

const helloCssDir = join(root, 'apps/remotes/hello/dist');
const helloCss = collectFiles(helloCssDir).filter((file) =>
  file.endsWith('.css'),
);
if (
  !helloCss.some((file) => {
    const css = readFileSync(file, 'utf8');
    return (
      css.includes('[data-nebula-css="hello"]') ||
      css.includes('[data-nebula-css=hello]')
    );
  }) ||
  helloCss.some((file) =>
    readFileSync(file, 'utf8').includes(
      '[data-nebula-css="hello"] [data-nebula-css=hello]',
    ),
  )
) {
  console.error('[check:mf-poc] hello CSS is missing namespaced selectors');
  process.exit(1);
}

const dualDist = join(root, 'apps/remotes/hello-dual/dist');
const manifestPath = join(dualDist, 'mf-manifest.json');
if (!existsSync(manifestPath)) {
  console.error('[check:mf-poc] missing hello-dual mf-manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const exposes = Array.isArray(manifest.exposes) ? manifest.exposes : [];
const runtimeExpose = exposes.find(
  (item) =>
    item.path === './runtime-application' ||
    item.name === 'runtime-application',
);
const designerExpose = exposes.find(
  (item) => item.path === './application' || item.name === 'application',
);
if (!runtimeExpose || !designerExpose) {
  console.error(
    '[check:mf-poc] mf-manifest.json missing application or runtime-application expose',
  );
  process.exit(1);
}

function exposeSyncJs(expose) {
  return (expose.assets?.js?.sync ?? []).map((file) => join(dualDist, file));
}

const runtimeJs = exposeSyncJs(runtimeExpose);
const designerJs = exposeSyncJs(designerExpose);
if (runtimeJs.some((file) => readFileSync(file, 'utf8').includes(marker))) {
  console.error(
    '[check:mf-poc] runtime-application sync assets contain DESIGNER_ONLY_MARKER',
  );
  process.exit(1);
}
if (!designerJs.some((file) => readFileSync(file, 'utf8').includes(marker))) {
  console.error(
    '[check:mf-poc] application expose is missing DESIGNER_ONLY_MARKER',
  );
  process.exit(1);
}

console.log(
  '[check:mf-poc] css namespace + dual-expose chunk isolation passed',
);

run('@nebula-studio/mf-poc-host', 'build');

let escaped = false;
try {
  resolvePocFile('hello', '/../package.json');
} catch {
  escaped = true;
}
if (!escaped || !existsSync(resolvePocFile('hello', '/mf-manifest.json'))) {
  console.error('[check:mf-poc] mf-poc protocol path mapping is invalid');
  process.exit(1);
}

const rewritten = JSON.parse(
  rewriteFederationPublicPath(
    readFileSync(resolvePocFile('hello', '/mf-manifest.json'), 'utf8'),
    'mf-poc://hello/',
  ),
);
if (rewritten?.metaData?.publicPath !== 'mf-poc://hello/') {
  console.error('[check:mf-poc] publicPath rewrite failed');
  process.exit(1);
}

const electronCheck = spawnSync(
  process.execPath,
  [join(root, 'apps/mf-poc-host/electron-poc/launch.mjs'), '--check'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
if (electronCheck.status !== 0) {
  console.error('[check:mf-poc] electron mf-poc:// serve check failed');
  process.exit(electronCheck.status ?? 1);
}

console.log('[check:mf-poc] electron mf-poc:// protocol serve passed');
