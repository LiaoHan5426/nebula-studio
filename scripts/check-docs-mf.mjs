import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const boot = readFileSync(
  join(root, 'apps/electron/src/renderer/boot.ts'),
  'utf8',
);
const webBoot = readFileSync(join(root, 'apps/web/src/web-boot.ts'), 'utf8');
const electronFederation = readFileSync(
  join(root, 'apps/electron/src/renderer/bootFederation.ts'),
  'utf8',
);
const builder = readFileSync(
  join(root, 'apps/electron/electron-builder.yml'),
  'utf8',
);

if (boot.includes('sub-web/docs/src/main.ts')) {
  console.error(
    '[check:docs-mf] Electron renderer still globs Docs main.ts; Host would keep Docs chunks',
  );
  process.exit(1);
}
if (!boot.includes('bootFederationRenderer')) {
  console.error(
    '[check:docs-mf] Electron renderer is not booting Docs via federation',
  );
  process.exit(1);
}
const integratedApps = readFileSync(
  join(root, 'apps/sub-web/frontend/src/platform/integratedApps.ts'),
  'utf8',
);
if (!integratedApps.includes('hydrateShellIntegratedAppsFromRuntime')) {
  console.error(
    '[check:docs-mf] Host sidebar is not hydrating catalog from frontend runtime API',
  );
  process.exit(1);
}
if (!webBoot.includes('fetchFrontendRuntimeEntries')) {
  console.error(
    '[check:docs-mf] Web Host is not loading federation remotes from frontend runtime API',
  );
  process.exit(1);
}
if (!electronFederation.includes('fetchFrontendRuntimeEntries')) {
  console.error(
    '[check:docs-mf] Electron Host is not loading federation remotes from frontend runtime API',
  );
  process.exit(1);
}
if (!builder.includes('remotes/docs')) {
  console.error(
    '[check:docs-mf] electron-builder.yml missing remotes/docs extraResources',
  );
  process.exit(1);
}

const result = spawnSync(
  'vp',
  ['run', '--filter', '@nebula-studio-renderer/docs', 'build'],
  { cwd: root, stdio: 'inherit', shell: true },
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const manifest = join(root, 'apps/sub-web/docs/dist/mf-manifest.json');
if (!existsSync(manifest)) {
  console.error(`[check:docs-mf] missing ${manifest}`);
  process.exit(1);
}

console.log(
  '[check:docs-mf] Docs remote build + Electron federation boot wiring passed',
);
