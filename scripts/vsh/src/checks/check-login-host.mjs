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

const webBoot = readFileSync(join(root, 'apps/web/src/web-boot.ts'), 'utf8');
const hostLogin = readFileSync(
  join(root, 'apps/web/src/auth/bootHostLogin.ts'),
  'utf8',
);
const federation = readFileSync(
  join(root, 'apps/sub-web/integration/src/federation.ts'),
  'utf8',
);
const windows = readFileSync(join(root, 'configs/windows.json'), 'utf8');
const electronBoot = readFileSync(
  join(root, 'apps/electron/src/renderer/boot.ts'),
  'utf8',
);

if (existsSync(join(root, 'apps/web/src/embed/login-entry.ts'))) {
  console.error(
    '[check:login-host] generated login-entry.ts must be removed; Host boots login directly',
  );
  process.exit(1);
}
if (
  webBoot.includes('nebulaEmbedBootEntries') ||
  webBoot.includes('embedLoaders')
) {
  console.error(
    '[check:login-host] Web boot must not glob generated embed entries',
  );
  process.exit(1);
}
if (!webBoot.includes("bootHostLogin('platform-embed')")) {
  console.error(
    '[check:login-host] Web boot must stamp Host login as platform-embed',
  );
  process.exit(1);
}
if (hostLogin.includes('detectRuntimeMode')) {
  console.error(
    '[check:login-host] Host login boot must take an explicit runtime mode',
  );
  process.exit(1);
}
if (!hostLogin.includes('@nebula-studio/shell-host')) {
  console.error(
    '[check:login-host] Host login boot must import @nebula-studio/shell-host',
  );
  process.exit(1);
}
if (!hostLogin.includes('installWebPresentationUnlessElectron')) {
  console.error(
    '[check:login-host] Host login boot must install web presentation at the composition root',
  );
  process.exit(1);
}
if (hostLogin.includes('webPresentation')) {
  console.error(
    '[check:login-host] runtime must not receive webPresentation; Host installs it itself',
  );
  process.exit(1);
}
if (federation.includes('@nebula-studio-renderer/login')) {
  console.error(
    '[check:login-host] Integration federation entry must not import Login',
  );
  process.exit(1);
}
if (!hostLogin.includes('@nebula-studio/login-ui')) {
  console.error(
    '[check:login-host] Host login boot must mount @nebula-studio/login-ui',
  );
  process.exit(1);
}
if (hostLogin.includes('@nebula-studio-renderer/login')) {
  console.error(
    '[check:login-host] Host login boot must not import the login renderer package',
  );
  process.exit(1);
}
if (
  !windows.includes('"renderer": "login"') ||
  !windows.includes('"webLoad": "host"')
) {
  console.error(
    '[check:login-host] windows.json login modal must stay Host-owned (webLoad=host)',
  );
  process.exit(1);
}
if (electronBoot.includes('sub-web/login/src/main.ts')) {
  console.error(
    '[check:login-host] Electron renderer still globs login main.ts',
  );
  process.exit(1);
}
if (!electronBoot.includes("bootHostLogin('electron')")) {
  console.error(
    "[check:login-host] Electron renderer must boot login via bootHostLogin('electron')",
  );
  process.exit(1);
}
if (!electronBoot.includes('@nebula-host-boot/login')) {
  console.error(
    '[check:login-host] Electron renderer must load Host login boot, not login/main.ts',
  );
  process.exit(1);
}
if (electronBoot.includes('@nebula-studio-renderer/login/boot')) {
  console.error(
    '[check:login-host] Electron renderer must not call sub-web login/boot',
  );
  process.exit(1);
}
if (existsSync(join(root, 'apps/sub-web/login/package.json'))) {
  console.error(
    '[check:login-host] obsolete login renderer package must stay deleted',
  );
  process.exit(1);
}

console.log('[check:login-host] ok');
