import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Structural locks ESLint cannot express:
 * required package.json deps, deleted-file locations, generated OpenAPI,
 * and generate-*.mjs orchestration (must import node kit / must not inline).
 *
 * Import graph, Host/Remote production deps, windows.json business fields,
 * detectRuntimeMode, and window.electron/api in product UI are ESLint
 * (`mf-boundary` + `host-boundary`). Run `vp run lint:eslint`.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function readManifest(rel) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    fail(`missing package.json: ${rel}`);
    return null;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function depNames(manifest, groups = ['dependencies', 'peerDependencies']) {
  const names = new Set();
  for (const group of groups) {
    for (const name of Object.keys(manifest?.[group] ?? {})) {
      names.add(name);
    }
  }
  return names;
}

const windowConfigKitPath = join(root, 'internal/node-kit/src/windowConfig.mjs');
if (!existsSync(windowConfigKitPath)) {
  fail(
    'window config generation must live in internal/node-kit/src/windowConfig.mjs',
  );
}
const generateWindowConfigs = readFileSync(
  join(root, 'scripts/generate-window-configs.mjs'),
  'utf8',
);
for (const banned of [
  'function validateConfig',
  'function generateTypeScript',
  'function joinOrigin',
  'new Ajv',
]) {
  if (generateWindowConfigs.includes(banned)) {
    fail(
      `scripts/generate-window-configs.mjs must not contain ${banned}; use @nebula-studio-internal/node-kit/window-config`,
    );
  }
}
if (
  !generateWindowConfigs.includes('@nebula-studio-internal/node-kit/window-config')
) {
  fail(
    'scripts/generate-window-configs.mjs must import @nebula-studio-internal/node-kit/window-config',
  );
}
const generateContracts = readFileSync(
  join(root, 'scripts/generate-contracts.mjs'),
  'utf8',
);
if (generateContracts.includes('function joinOrigin')) {
  fail(
    'scripts/generate-contracts.mjs must import joinOrigin from @nebula-studio-internal/node-kit/join-origin',
  );
}

const runtimeAddressDriftPath = join(
  root,
  'internal/node-kit/src/runtimeAddressDrift.mjs',
);
if (!existsSync(runtimeAddressDriftPath)) {
  fail(
    'runtime address drift scanning must live in internal/node-kit/src/runtimeAddressDrift.mjs',
  );
}
const checkGenerated = readFileSync(
  join(root, 'scripts/check-generated.mjs'),
  'utf8',
);
for (const banned of [
  'function scanRuntimeAddressDrift',
  'function collectOffenders',
  'RUNTIME_ADDRESS_PATTERN',
]) {
  if (checkGenerated.includes(banned)) {
    fail(
      `scripts/check-generated.mjs must not contain ${banned}; use @nebula-studio-internal/node-kit/runtime-address-drift`,
    );
  }
}
if (
  !checkGenerated.includes('@nebula-studio-internal/node-kit/runtime-address-drift')
) {
  fail(
    'scripts/check-generated.mjs must import @nebula-studio-internal/node-kit/runtime-address-drift',
  );
}

if (
  !generateContracts.includes('@nebula-studio-internal/node-kit/frontend-openapi')
) {
  fail(
    'scripts/generate-contracts.mjs must ensure FrontendApplication OpenAPI via @nebula-studio-internal/node-kit/frontend-openapi',
  );
}
const openApiSpecPath = join(root, 'packages/contracts/generated/openapi.json');
if (existsSync(openApiSpecPath)) {
  const openApi = JSON.parse(readFileSync(openApiSpecPath, 'utf8'));
  if (!openApi.paths?.['/api/system/frontend-apps/runtime']) {
    fail('generated OpenAPI must include /api/system/frontend-apps/runtime');
  }
  if (!openApi.components?.schemas?.FrontendRuntimeEntryView) {
    fail('generated OpenAPI must include FrontendRuntimeEntryView schema');
  }
}
const facadeSource = readFileSync(
  join(root, 'packages/contracts/generated/facade.ts'),
  'utf8',
);
if (!facadeSource.includes('GeneratedFrontendRuntimeEntryView')) {
  fail(
    'contracts generated facade must alias GeneratedFrontendRuntimeEntryView',
  );
}

const mswManifestPath = join(root, 'packages/testing/msw/package.json');
if (!existsSync(mswManifestPath)) {
  fail('MSW package must live at packages/testing/msw (not packages/core/msw)');
} else {
  const msw = JSON.parse(readFileSync(mswManifestPath, 'utf8'));
  if (msw.name !== '@nebula-studio/msw') {
    fail('packages/testing/msw must remain @nebula-studio/msw');
  }
}
if (existsSync(join(root, 'packages/core/msw/package.json'))) {
  fail('packages/core/msw must be removed after moving MSW to testing');
}

const shellManifestPath = join(root, 'packages/ui/shell-ui/package.json');
if (!existsSync(shellManifestPath)) {
  fail(
    'nebula-shell must live at packages/ui/shell-ui (not packages/core/shell)',
  );
} else {
  const shell = JSON.parse(readFileSync(shellManifestPath, 'utf8'));
  if (shell.name !== '@nebula-studio/nebula-shell') {
    fail('packages/ui/shell-ui must remain @nebula-studio/nebula-shell');
  }
}
if (existsSync(join(root, 'packages/core/shell/package.json'))) {
  fail('packages/core/shell must be removed after moving nebula-shell to ui');
}

const assemblyBootPath = join(
  root,
  'packages/platform/assembly-boot/package.json',
);
if (!existsSync(assemblyBootPath)) {
  fail(
    'assembly-boot must live at packages/platform/assembly-boot (not apps/sub-web/assembly-boot)',
  );
} else {
  const assemblyBoot = JSON.parse(readFileSync(assemblyBootPath, 'utf8'));
  if (assemblyBoot.name !== '@nebula-studio-renderer/assembly-boot') {
    fail(
      'packages/platform/assembly-boot must remain @nebula-studio-renderer/assembly-boot',
    );
  }
}
if (existsSync(join(root, 'apps/sub-web/assembly-boot/package.json'))) {
  fail(
    'apps/sub-web/assembly-boot must be removed after moving assembly-boot to platform',
  );
}

const protocolManifestPath = join(
  root,
  'packages/platform/shell-protocol/package.json',
);
if (!existsSync(protocolManifestPath)) {
  fail('shell-protocol must live at packages/platform/shell-protocol');
}

const shellHostManifestPath = join(
  root,
  'packages/platform/shell-host/package.json',
);
if (!existsSync(shellHostManifestPath)) {
  fail('shell-host must live at packages/platform/shell-host');
}

if (
  existsSync(
    join(root, 'packages/core/app-shell/src/web/installWebPresentation.ts'),
  )
) {
  fail(
    'installWebPresentation must live in packages/platform/shell-host, not app-shell',
  );
}
if (existsSync(join(root, 'packages/core/app-shell/src/web/webAuth.ts'))) {
  fail('webAuth helpers must live in @nebula-studio/auth-provider/web');
}
if (
  existsSync(join(root, 'packages/core/app-shell/src/common/layoutHost.ts'))
) {
  fail('layoutHost helpers must live in @nebula-studio/shell-protocol');
}
if (existsSync(join(root, 'packages/core/runtime/src/detectMode.ts'))) {
  fail('packages/core/runtime/src/detectMode.ts must stay deleted');
}

if (existsSync(join(root, 'tools/tailwindcss/src/electron.ts'))) {
  fail('tools/tailwindcss production electron.ts entry must stay deleted');
}
if (existsSync(join(root, 'tools/tailwindcss/src/index.ts'))) {
  fail('tools/tailwindcss production index.ts entry must stay deleted');
}
const themeCss = readFileSync(
  join(root, 'tools/tailwindcss/src/theme.css'),
  'utf8',
);
if (
  themeCss.includes("@source '../../../packages/'") ||
  themeCss.includes("@source '../../../apps/'")
) {
  fail(
    'theme.css must not scan ../../../packages or ../../../apps; use nebulaTailwindSourcePlugin',
  );
}
for (const shim of [
  'common/presentationHost.ts',
  'common/shellEventBus.ts',
  'common/shellEmbedMessaging.ts',
  'common/activeViewPreference.ts',
  'common/shellHostStorageKeys.ts',
]) {
  if (existsSync(join(root, 'packages/core/app-shell/src', shim))) {
    fail(
      `app-shell shim ${shim} must stay deleted; import shell-protocol directly`,
    );
  }
}

const web = readManifest('apps/web/package.json');
const electron = readManifest('apps/electron/package.json');
const appShell = readManifest('packages/core/app-shell/package.json');
const assemblyBootManifest = readManifest(
  'packages/platform/assembly-boot/package.json',
);
const applicationBootstrap = readManifest(
  'packages/platform/application-bootstrap/package.json',
);
const shellHost = readManifest('packages/platform/shell-host/package.json');

if (
  appShell &&
  depNames(appShell, ['dependencies']).has('@nebula-studio/shell-protocol')
) {
  fail(
    'app-shell must not depend on shell-protocol; callers import it directly',
  );
}
if (
  appShell &&
  depNames(appShell, ['dependencies']).has('@nebula-studio/auth-provider')
) {
  fail(
    'app-shell must not depend on auth-provider; callers import it directly',
  );
}
const internalRuntimeBan = /@nebula-studio-internal\/(node-kit|build-kit)(?:\/|'|"|$)/;
const skipDirNames = new Set([
  '.git',
  '__tests__',
  'dev-dist',
  'dist',
  'node_modules',
  'out',
]);

function scanProductRuntimeImports(relDir) {
  const abs = join(root, relDir);
  if (!existsSync(abs)) {
    return;
  }
  const stack = [abs];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirNames.has(entry.name)) {
          stack.push(path);
        }
        continue;
      }
      if (
        /\.(config|config\.mts)$/.test(entry.name) ||
        entry.name.includes('.test.') ||
        entry.name.includes('.spec.') ||
        entry.name === 'electron.vite.config.ts' ||
        entry.name === 'vite.config.ts'
      ) {
        continue;
      }
      if (!/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        continue;
      }
      const source = readFileSync(path, 'utf8');
      if (internalRuntimeBan.test(source)) {
        fail(
          `${relativePosix(path)} must not import @nebula-studio-internal/node-kit or vite at runtime`,
        );
      }
    }
  }
}

function relativePosix(absPath) {
  return absPath.slice(root.length + 1).replaceAll('\\', '/');
}

scanProductRuntimeImports('apps');
scanProductRuntimeImports('packages');

for (const rel of [
  'apps/web/package.json',
  'apps/electron/package.json',
  'apps/sub-web/docs/package.json',
  'apps/sub-web/settings/package.json',
  'apps/sub-web/integration/package.json',
  'apps/sub-web/frontend/package.json',
  'apps/sub-web/login/package.json',
]) {
  const manifest = readManifest(rel);
  if (
    manifest &&
    depNames(manifest, ['dependencies']).has('@nebula-studio-internal/tailwind')
  ) {
    fail(`${rel} must import @nebula-studio/styles, not internal/tailwind`);
  }
}
for (const rel of [
  'apps/web/package.json',
  'apps/electron/package.json',
  'apps/sub-web/docs/package.json',
  'apps/sub-web/settings/package.json',
  'apps/sub-web/integration/package.json',
  'apps/sub-web/frontend/package.json',
  'apps/sub-web/login/package.json',
  'packages/core/app-shell/package.json',
  'packages/platform/application-bootstrap/package.json',
  'packages/platform/shell-host/package.json',
  'packages/platform/shell-protocol/package.json',
  'packages/platform/application-runtime/package.json',
  'packages/styles/package.json',
]) {
  const manifest = readManifest(rel);
  if (
    manifest &&
    depNames(manifest, ['dependencies']).has('@nebula-studio-internal/node-kit')
  ) {
    fail(
      `${rel} production deps must not include @nebula-studio-internal/node-kit`,
    );
  }
  if (
    manifest &&
    depNames(manifest, ['dependencies']).has('@nebula-studio-internal/build-kit')
  ) {
    fail(
      `${rel} production deps must not include @nebula-studio-internal/build-kit`,
    );
  }
}
const appShellIndex = readFileSync(
  join(root, 'packages/core/app-shell/src/index.ts'),
  'utf8',
);
if (appShellIndex.includes("from '@nebula-studio/shell-protocol'")) {
  fail('app-shell/src/index.ts must not re-export shell-protocol');
}
if (appShellIndex.includes("from '@nebula-studio/auth-provider")) {
  fail('app-shell/src/index.ts must not re-export auth-provider');
}
if (
  electron &&
  depNames(electron, ['dependencies']).has('@nebula-studio-internal/node-kit')
) {
  fail(
    'Electron production dependencies must not include @nebula-studio-internal/node-kit',
  );
}
for (const remoteFed of [
  'apps/sub-web/docs/src/federation.ts',
  'apps/sub-web/settings/src/federation.ts',
  'apps/sub-web/integration/src/federation.ts',
]) {
  const source = readFileSync(join(root, remoteFed), 'utf8');
  if (
    source.includes('styles/document') ||
    source.includes('tailwind/electron') ||
    source.includes('document.documentElement.dataset.nebulaCss')
  ) {
    fail(`${remoteFed} must use styles/remote and container-only cssNamespace`);
  }
}
if (
  assemblyBootManifest &&
  !depNames(assemblyBootManifest, ['dependencies']).has(
    '@nebula-studio/shell-protocol',
  )
) {
  fail('assembly-boot must depend on @nebula-studio/shell-protocol');
}
if (web && !depNames(web, ['dependencies']).has('@nebula-studio/shell-host')) {
  fail('Web Host must depend on @nebula-studio/shell-host');
}
if (
  electron &&
  !depNames(electron, ['dependencies']).has('@nebula-studio/shell-host')
) {
  fail('Electron Host must depend on @nebula-studio/shell-host');
}
if (
  shellHost &&
  !depNames(shellHost, [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
  ]).has('@nebula-studio/app-shell')
) {
  fail('shell-host must depend on @nebula-studio/app-shell');
}
if (
  shellHost &&
  !depNames(shellHost, [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
  ]).has('@nebula-studio/shell-protocol')
) {
  fail('shell-host must depend on @nebula-studio/shell-protocol');
}
if (!applicationBootstrap?.dependencies?.['@nebula-studio/shell-protocol']) {
  fail('application-bootstrap must depend on @nebula-studio/shell-protocol');
}

const hostWorkspaceBoot = join(
  root,
  'apps/web/src/workspace/bootHostWorkspace.ts',
);
if (existsSync(hostWorkspaceBoot)) {
  const source = readFileSync(hostWorkspaceBoot, 'utf8');
  if (!source.includes('@nebula-studio/shell-host')) {
    fail('bootHostWorkspace must import @nebula-studio/shell-host');
  }
  if (!source.includes('installShellHostBridge')) {
    fail('bootHostWorkspace must install ShellHostBridge');
  }
}
const hostLoginBoot = join(root, 'apps/web/src/auth/bootHostLogin.ts');
if (existsSync(hostLoginBoot)) {
  const source = readFileSync(hostLoginBoot, 'utf8');
  if (!source.includes('@nebula-studio/shell-host')) {
    fail('bootHostLogin must import @nebula-studio/shell-host');
  }
}

if (failures.length > 0) {
  console.error('[check:boundaries]');
  for (const message of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log('[check:boundaries] ok');
