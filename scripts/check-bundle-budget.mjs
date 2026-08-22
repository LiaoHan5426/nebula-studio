import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'apps', 'web', 'dist');
const manifestPath = join(distDir, '.vite', 'manifest.json');
const baseline = JSON.parse(
  readFileSync(join(root, 'configs', 'bundle-baseline.json'), 'utf8'),
);
const kib = (bytes) => bytes / 1024;
const gzipKib = (file) =>
  kib(gzipSync(readFileSync(join(distDir, file))).length);
const gzipFileKib = (abs) => kib(gzipSync(readFileSync(abs)).length);

const requireRemotes = process.env.NEBULA_CHECK_REMOTE_BUNDLES === 'true';

const failures = [];

if (!existsSync(manifestPath)) {
  throw new Error(
    '[bundle-budget] missing apps/web/dist/.vite/manifest.json — run vp run build:web first',
  );
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const entry = Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error('[bundle-budget] Vite manifest has no entry chunk');

const syncFiles = new Set();
function collectSync(item) {
  if (!item || syncFiles.has(item.file)) return;
  syncFiles.add(item.file);
  for (const imported of item.imports ?? []) collectSync(manifest[imported]);
}
collectSync(entry);

const initialGzipKib = [...syncFiles].reduce(
  (sum, file) => sum + gzipKib(file),
  0,
);
const hostMax = baseline.hostInitialSyncJsGzipKibMax ?? 350;
if (initialGzipKib > hostMax) {
  failures.push(
    `initial synchronous JS ${initialGzipKib.toFixed(2)} KiB > ${hostMax} KiB`,
  );
}

const budgets = [['vendor-vxe-', 250]];
const assetFiles = existsSync(join(distDir, 'assets'))
  ? readdirSync(join(distDir, 'assets')).filter((file) => file.endsWith('.js'))
  : [];
const leakedEditorRuntime = assetFiles.filter((file) =>
  (baseline.hostMustNotContainEditorChunkPrefixes ?? []).some((prefix) =>
    file.startsWith(prefix),
  ),
);
if (leakedEditorRuntime.length) {
  failures.push(
    `Host dist still contains Integration editor chunks: ${leakedEditorRuntime.join(', ')}`,
  );
}
for (const [prefix, limit] of budgets) {
  for (const file of assetFiles.filter((candidate) =>
    candidate.startsWith(prefix),
  )) {
    const size = gzipKib(`assets/${file}`);
    if (size > limit)
      failures.push(`${file} ${size.toFixed(2)} KiB > ${limit} KiB`);
  }
}

const remoteIds = Object.keys(baseline.remotes ?? {});
const remotes = {};
for (const id of remoteIds) {
  const remoteDist = join(root, 'apps', 'sub-web', id, 'dist');
  const max = baseline.remotes[id].totalJsGzipKibMax;
  if (!existsSync(remoteDist)) {
    if (requireRemotes) {
      failures.push(`missing remote dist for ${id}: ${remoteDist}`);
    }
    remotes[id] = { skipped: true };
    continue;
  }
  const jsFiles = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.js')) {
        jsFiles.push(path);
      }
    }
  };
  walk(remoteDist);
  const totalJsGzipKib = jsFiles.reduce(
    (sum, file) => sum + gzipFileKib(file),
    0,
  );
  remotes[id] = {
    jsFileCount: jsFiles.length,
    totalJsGzipKib: Number(totalJsGzipKib.toFixed(2)),
    budgetKib: max,
  };
  if (totalJsGzipKib > max) {
    failures.push(
      `remote ${id} JS ${totalJsGzipKib.toFixed(2)} KiB > ${max} KiB`,
    );
  }
}

const report = {
  host: {
    initialSyncJsGzipKib: Number(initialGzipKib.toFixed(2)),
    budgetKib: hostMax,
    syncFileCount: syncFiles.size,
    leakedEditorChunks: leakedEditorRuntime,
  },
  shared: baseline.shared,
  remotes,
};

writeFileSync(
  join(distDir, 'nebula-bundle-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  `[bundle-budget] Host initial synchronous JS: ${initialGzipKib.toFixed(2)} KiB / ${hostMax} KiB`,
);
for (const [id, info] of Object.entries(remotes)) {
  if (info.skipped) {
    console.log(`[bundle-budget] remote ${id}: dist missing (skipped)`);
    continue;
  }
  console.log(
    `[bundle-budget] remote ${id}: ${info.totalJsGzipKib} KiB gzip JS / ${info.budgetKib} KiB`,
  );
}

if (failures.length) {
  throw new Error(`[bundle-budget] exceeded:\n- ${failures.join('\n- ')}`);
}
console.log('[bundle-budget] all budgets passed');
console.log(`[bundle-budget] wrote ${join(distDir, 'nebula-bundle-report.json')}`);
