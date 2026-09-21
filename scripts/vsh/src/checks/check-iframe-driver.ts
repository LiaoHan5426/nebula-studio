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
const validator = readFileSync(
  join(
    root,
    '../nebula/nebula-system/nebula-system-app/src/main/java/com/lh/system/app/support/FrontendManifestValidator.java',
  ),
  'utf8',
);
const migration = readFileSync(
  join(
    root,
    '../nebula/db/migration/postgresql/platform/V017__frontend_iframe_external_drivers.sql',
  ),
  'utf8',
);
const electronConfig = readFileSync(
  join(root, 'apps/electron/electron.vite.config.ts'),
  'utf8',
);
const guest = join(root, 'apps/web/public/iframe-guest.html');
const electronGuest = join(root, 'apps/electron/public/iframe-guest.html');
const bridge = readFileSync(
  join(root, 'packages/platform/host-capabilities/src/iframeBridge.ts'),
  'utf8',
);
const hostCsp = readFileSync(
  join(root, 'packages/platform/application-runtime/src/hostCsp.ts'),
  'utf8',
);
const crossMigration = readFileSync(
  join(
    root,
    '../nebula/db/migration/postgresql/platform/V019__frontend_iframe_cross_origin.sql',
  ),
  'utf8',
);
const apps = readFileSync(
  join(root, 'apps/web/src/platform/integratedApps.ts'),
  'utf8',
);
const shellApp = readFileSync(
  join(root, 'apps/web/src/workspace/WorkspaceApp.vue'),
  'utf8',
);

if (
  !validator.includes('validateIframe') ||
  !validator.includes('validateExternal')
) {
  console.error(
    '[check:iframe-driver] backend validator missing iframe/external checks',
  );
  process.exit(1);
}
if (
  !migration.includes("'iframe-demo'") ||
  !migration.includes("'external-demo'")
) {
  console.error(
    '[check:iframe-driver] V017 must seed iframe-demo and external-demo',
  );
  process.exit(1);
}
if (!existsSync(guest) || !existsSync(electronGuest)) {
  console.error(
    '[check:iframe-driver] missing iframe-guest.html for Web/Electron public',
  );
  process.exit(1);
}
if (
  !electronConfig.includes("publicDir: resolve(import.meta.dirname, 'public')")
) {
  console.error(
    '[check:iframe-driver] Electron renderer must serve apps/electron/public (iframe guest)',
  );
  process.exit(1);
}
const webVite = readFileSync(join(root, 'apps/web/vite.config.ts'), 'utf8');
if (
  !webVite.includes('host: true') ||
  !electronConfig.includes('host: true') ||
  !webVite.includes("'127.0.0.1'")
) {
  console.error(
    '[check:iframe-driver] Host Vite must listen on 127.0.0.1 so cross-origin iframe can load',
  );
  process.exit(1);
}
if (/postMessage\([^)]*['"]\*['"]/.test(bridge)) {
  console.error(
    '[check:iframe-driver] iframe bridge must not postMessage to *',
  );
  process.exit(1);
}
if (
  !bridge.includes('IFRAME_HANDSHAKE_TYPE') ||
  !apps.includes('isRememberedIframeApp')
) {
  console.error(
    '[check:iframe-driver] Host is not wiring iframe/external runtime apps',
  );
  process.exit(1);
}

if (
  !bridge.includes('negotiateIframeProtocolVersion') ||
  !bridge.includes('cancel(requestId') ||
  !bridge.includes('IFRAME_REQUEST_TIMEOUT_MS')
) {
  console.error(
    '[check:iframe-driver] iframe bridge missing protocol negotiation, cancel, or request timeout',
  );
  process.exit(1);
}
if (!shellApp.includes('iframeCapabilityBridges')) {
  console.error(
    '[check:iframe-driver] Host must keep iframe bridges until unmount dispose',
  );
  process.exit(1);
}
if (
  !hostCsp.includes('alignLoopbackIframeSrc') ||
  !hostCsp.includes('isIframeSrcAllowed')
) {
  console.error(
    '[check:iframe-driver] Host must align loopback iframe ports and enforce allowedOrigins',
  );
  process.exit(1);
}
if (
  !crossMigration.includes("'iframe-cross-demo'") ||
  !validator.includes('allowedOrigins must not contain *')
) {
  console.error(
    '[check:iframe-driver] V019 must seed iframe-cross-demo and validator must reject *',
  );
  process.exit(1);
}
const webGuest = readFileSync(guest, 'utf8');
const electronGuestHtml = readFileSync(electronGuest, 'utf8');
if (webGuest !== electronGuestHtml) {
  console.error(
    '[check:iframe-driver] Web and Electron iframe-guest.html must stay identical',
  );
  process.exit(1);
}
if (
  !webGuest.includes("request.type === 'cancel'") ||
  !webGuest.includes("request.type === 'dispose'")
) {
  console.error(
    '[check:iframe-driver] iframe guest must honor cancel and dispose',
  );
  process.exit(1);
}

console.log('[check:iframe-driver] ok');
