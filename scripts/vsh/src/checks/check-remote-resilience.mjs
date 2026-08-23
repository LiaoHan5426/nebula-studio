import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webBoot = readFileSync(join(root, 'apps/web/src/web-boot.ts'), 'utf8');
const electronFederation = readFileSync(
  join(root, 'apps/electron/src/renderer/bootFederation.ts'),
  'utf8',
);
const webCsp = readFileSync(join(root, 'apps/web/index.html'), 'utf8');
const electronCsp = readFileSync(
  join(root, 'apps/electron/src/renderer/index.html'),
  'utf8',
);
const runtime = readFileSync(
  join(
    root,
    '../nebula/nebula-system/nebula-system-app/src/main/java/com/lh/system/app/service/impl/read/FrontendApplicationReadServiceImpl.java',
  ),
  'utf8',
);

const telemetry = readFileSync(
  join(
    root,
    '../nebula/nebula-system/nebula-system-app/src/main/java/com/lh/system/app/rest/FrontendApplicationRestService.java',
  ),
  'utf8',
);
const flyway = readFileSync(
  join(
    root,
    '../nebula/db/migration/postgresql/platform/V018__frontend_remote_telemetry.sql',
  ),
  'utf8',
);
const builder = readFileSync(
  join(root, 'apps/electron/electron-builder.yml'),
  'utf8',
);
const validator = readFileSync(
  join(
    root,
    '../nebula/nebula-system/nebula-system-app/src/main/java/com/lh/system/app/support/FrontendManifestValidator.java',
  ),
  'utf8',
);
const runtimeView = readFileSync(
  join(
    root,
    '../nebula/nebula-system/nebula-system-app/src/main/java/com/lh/system/app/dto/FrontendRuntimeEntryView.java',
  ),
  'utf8',
);

if (
  !webBoot.includes('mountWithLastKnownGood') ||
  !electronFederation.includes('mountWithLastKnownGood')
) {
  console.error(
    '[check:remote-resilience] Host federation boot must mount with last-known-good',
  );
  process.exit(1);
}
if (
  !webBoot.includes('createFrontendTelemetryReporter') ||
  !electronFederation.includes('createFrontendTelemetryReporter')
) {
  console.error(
    '[check:remote-resilience] Host federation boot must report remote telemetry',
  );
  process.exit(1);
}
if (
  !webCsp.includes("frame-src 'self' http://localhost:* http://127.0.0.1:*") ||
  !electronCsp.includes(
    "frame-src 'self' http://localhost:* http://127.0.0.1:*",
  ) ||
  !webCsp.includes("base-uri 'self'") ||
  !electronCsp.includes("object-src 'none'")
) {
  console.error(
    '[check:remote-resilience] Host CSP must declare frame-src self plus loopback, base-uri, object-src none',
  );
  process.exit(1);
}
if (!runtime.includes('rolloutPercent() <= 0')) {
  console.error(
    '[check:remote-resilience] runtime API must omit rolloutPercent=0 applications',
  );
  process.exit(1);
}
if (!telemetry.includes('@PostMapping("/telemetry")')) {
  console.error(
    '[check:remote-resilience] runtime API must ingest remote telemetry',
  );
  process.exit(1);
}
if (!flyway.includes('nebula_frontend_application_event')) {
  console.error(
    '[check:remote-resilience] missing Flyway V018 remote telemetry table',
  );
  process.exit(1);
}
if (
  !builder.includes('remotes/docs') ||
  !builder.includes('remotes/settings') ||
  !builder.includes('remotes/integration')
) {
  console.error(
    '[check:remote-resilience] electron-builder extraResources must pin packaged remotes',
  );
  process.exit(1);
}
const rootPkg = readFileSync(join(root, 'package.json'), 'utf8');
if (!rootPkg.includes('build:federation-remotes && vp run web#build')) {
  console.error(
    '[check:remote-resilience] Web Host build must embed first-party remotes',
  );
  process.exit(1);
}
const hostRemotesPlugin = readFileSync(
  join(root, 'internal/build-kit/src/federation/nebulaHostDevRemotesPlugin.ts'),
  'utf8',
);
if (
  !hostRemotesPlugin.includes('copyHostOwnedRemotesIntoOutDir') ||
  !hostRemotesPlugin.includes('writeBundle')
) {
  console.error(
    '[check:remote-resilience] Web Host must copy first-party remotes into dist/__nebula-mf',
  );
  process.exit(1);
}
if (!validator.includes('nebula-sig-v1')) {
  console.error(
    '[check:remote-resilience] registry must validate public-key signature envelopes',
  );
  process.exit(1);
}
if (!runtimeView.includes('row.getSignature()')) {
  console.error(
    '[check:remote-resilience] runtime API must expose signature envelopes, not private keys',
  );
  process.exit(1);
}
if (!runtimeView.includes('row.getAllowedOrigins()')) {
  console.error(
    '[check:remote-resilience] runtime API must expose iframe allowedOrigins',
  );
  process.exit(1);
}
const noncePlugin = readFileSync(
  join(root, 'internal/build-kit/src/plugin/nebulaHostCspNoncePlugin.ts'),
  'utf8',
);
const webVite = readFileSync(join(root, 'apps/web/vite.config.ts'), 'utf8');
const electronVite = readFileSync(
  join(root, 'apps/electron/electron.vite.config.ts'),
  'utf8',
);
if (
  !webVite.includes('nebulaHostCspNoncePlugin()') ||
  !electronVite.includes('nebulaHostCspNoncePlugin()')
) {
  console.error(
    '[check:remote-resilience] Web/Electron Host must enable production CSP nonce plugin',
  );
  process.exit(1);
}
if (
  !noncePlugin.includes("env.command !== 'build'") ||
  !webCsp.includes("script-src 'self' 'unsafe-inline'")
) {
  console.error(
    '[check:remote-resilience] CSP nonce is production-only; Web dev HTML must keep script unsafe-inline for HMR',
  );
  process.exit(1);
}

console.log('[check:remote-resilience] ok');
