import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
);
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
const webPackage = readFileSync(join(root, 'apps/web/package.json'), 'utf8');
const windows = readFileSync(join(root, 'configs/windows.json'), 'utf8');

if (boot.includes('sub-web/settings/src/main.ts')) {
  console.error(
    '[check:settings-mf] Electron renderer still globs Settings main.ts; Host would keep Settings chunks',
  );
  process.exit(1);
}
if (webPackage.includes('@nebula-studio-renderer/settings')) {
  console.error(
    '[check:settings-mf] Web Host still statically depends on Settings package',
  );
  process.exit(1);
}
if (
  !windows.includes('"webLoad": "federation"') ||
  !windows.includes('"renderer": "settings"')
) {
  console.error('[check:settings-mf] windows.json settings is not federation');
  process.exit(1);
}
if (existsSync(join(root, 'apps/web/src/embed/settings-entry.ts'))) {
  console.error('[check:settings-mf] settings-entry.ts still exists');
  process.exit(1);
}
if (!webBoot.includes('localFederationRegistration')) {
  console.error(
    '[check:settings-mf] Web Host is not resolving Settings via federation fallbacks',
  );
  process.exit(1);
}
if (!electronFederation.includes("renderer === 'settings'")) {
  console.error(
    '[check:settings-mf] Electron Host is not loading Settings federation',
  );
  process.exit(1);
}
if (!builder.includes('remotes/settings')) {
  console.error(
    '[check:settings-mf] electron-builder.yml missing remotes/settings extraResources',
  );
  process.exit(1);
}

const result = spawnSync(
  'vp',
  ['run', '--filter', '@nebula-studio-renderer/settings', 'build'],
  { cwd: root, stdio: 'inherit', shell: true },
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const manifest = join(root, 'apps/sub-web/settings/dist/mf-manifest.json');
if (!existsSync(manifest)) {
  console.error(`[check:settings-mf] missing ${manifest}`);
  process.exit(1);
}

console.log(
  '[check:settings-mf] Settings remote build + Host federation wiring passed',
);
