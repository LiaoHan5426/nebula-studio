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

const shellEntry = readFileSync(
  join(root, 'apps/web/src/shell-entry.ts'),
  'utf8',
);
const hostWorkspace = readFileSync(
  join(root, 'apps/web/src/workspace/bootHostWorkspace.ts'),
  'utf8',
);
const windows = readFileSync(join(root, 'configs/windows.json'), 'utf8');
const electronBoot = readFileSync(
  join(root, 'apps/electron/src/renderer/boot.ts'),
  'utf8',
);

if (shellEntry.includes('@nebula-studio-renderer/main/boot')) {
  console.error(
    '[check:host-workspace] Host shell-entry must not call sub-web main/boot',
  );
  process.exit(1);
}
if (!shellEntry.includes("bootHostWorkspace('standalone')")) {
  console.error(
    '[check:host-workspace] Host shell-entry must stamp workspace as standalone',
  );
  process.exit(1);
}
if (hostWorkspace.includes('detectRuntimeMode')) {
  console.error(
    '[check:host-workspace] Host workspace boot must take an explicit runtime mode',
  );
  process.exit(1);
}
if (!hostWorkspace.includes('@nebula-studio/shell-host')) {
  console.error(
    '[check:host-workspace] Host workspace boot must import @nebula-studio/shell-host',
  );
  process.exit(1);
}
if (!hostWorkspace.includes('installShellHostBridge')) {
  console.error(
    '[check:host-workspace] Host workspace boot must install ShellHostBridge before mount',
  );
  process.exit(1);
}
if (!hostWorkspace.includes('installWebPresentationUnlessElectron')) {
  console.error(
    '[check:host-workspace] Host workspace boot must install web presentation at the composition root',
  );
  process.exit(1);
}
if (hostWorkspace.includes('webPresentation')) {
  console.error(
    '[check:host-workspace] runtime must not receive webPresentation; Host installs it itself',
  );
  process.exit(1);
}
if (!hostWorkspace.includes('@/workspace/WorkspaceApp.vue')) {
  console.error(
    '[check:host-workspace] Host workspace boot must mount its Host-owned Workspace UI',
  );
  process.exit(1);
}
if (!windows.includes('"renderer": "frontend"')) {
  console.error(
    '[check:host-workspace] windows.json main renderer mapping must stay in place',
  );
  process.exit(1);
}
if (electronBoot.includes('sub-web/frontend/src/main.ts')) {
  console.error(
    '[check:host-workspace] Electron renderer still globs frontend main.ts',
  );
  process.exit(1);
}
if (!electronBoot.includes("bootHostWorkspace('electron')")) {
  console.error(
    '[check:host-workspace] Electron renderer must boot workspace via bootHostWorkspace',
  );
  process.exit(1);
}
if (!electronBoot.includes('@nebula-studio/shell-host')) {
  console.error(
    '[check:host-workspace] Electron renderer must import iframe bridge from @nebula-studio/shell-host',
  );
  process.exit(1);
}
if (!electronBoot.includes('@nebula-host-boot/workspace')) {
  console.error(
    '[check:host-workspace] Electron renderer must load Host workspace boot, not frontend/main.ts',
  );
  process.exit(1);
}
if (electronBoot.includes('@nebula-studio-renderer/main/boot')) {
  console.error(
    '[check:host-workspace] Electron renderer must not call sub-web main/boot',
  );
  process.exit(1);
}
if (existsSync(join(root, 'apps/sub-web/frontend/package.json'))) {
  console.error(
    '[check:host-workspace] obsolete frontend renderer package must stay deleted',
  );
  process.exit(1);
}

console.log('[check:host-workspace] ok');
