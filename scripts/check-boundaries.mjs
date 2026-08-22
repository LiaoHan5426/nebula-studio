import { existsSync, readFileSync } from 'node:fs';
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

const windowConfigKitPath = join(root, 'internal/node/src/windowConfig.mjs');
if (!existsSync(windowConfigKitPath)) {
  fail(
    'window config generation must live in internal/node/src/windowConfig.mjs',
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
      `scripts/generate-window-configs.mjs must not contain ${banned}; use @nebula-studio-internal/node/window-config`,
    );
  }
}
if (
  !generateWindowConfigs.includes('@nebula-studio-internal/node/window-config')
) {
  fail(
    'scripts/generate-window-configs.mjs must import @nebula-studio-internal/node/window-config',
  );
}
const generateContracts = readFileSync(
  join(root, 'scripts/generate-contracts.mjs'),
  'utf8',
);
if (generateContracts.includes('function joinOrigin')) {
  fail(
    'scripts/generate-contracts.mjs must import joinOrigin from @nebula-studio-internal/node/join-origin',
  );
}

const runtimeAddressDriftPath = join(
  root,
  'internal/node/src/runtimeAddressDrift.mjs',
);
if (!existsSync(runtimeAddressDriftPath)) {
  fail(
    'runtime address drift scanning must live in internal/node/src/runtimeAddressDrift.mjs',
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
      `scripts/check-generated.mjs must not contain ${banned}; use @nebula-studio-internal/node/runtime-address-drift`,
    );
  }
}
if (
  !checkGenerated.includes('@nebula-studio-internal/node/runtime-address-drift')
) {
  fail(
    'scripts/check-generated.mjs must import @nebula-studio-internal/node/runtime-address-drift',
  );
}

if (
  !generateContracts.includes('@nebula-studio-internal/node/frontend-openapi')
) {
  fail(
    'scripts/generate-contracts.mjs must ensure FrontendApplication OpenAPI via @nebula-studio-internal/node/frontend-openapi',
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
for (const shim of [
  'common/presentationHost.ts',
  'common/shellEventBus.ts',
  'common/shellEmbedMessaging.ts',
  'common/activeViewPreference.ts',
  'common/shellHostStorageKeys.ts',
]) {
  if (existsSync(join(root, 'packages/core/app-shell/src', shim))) {
    fail(
      `app-shell shim ${shim} must be deleted; re-export shell-protocol from index`,
    );
  }
}

const web = readManifest('apps/web/package.json');
const electron = readManifest('apps/electron/package.json');
const appShell = readManifest('packages/core/app-shell/package.json');
const assemblyBootManifest = readManifest(
  'packages/platform/assembly-boot/package.json',
);
const runtime = readManifest('packages/core/runtime/package.json');
const shellHost = readManifest('packages/platform/shell-host/package.json');

if (
  appShell &&
  !depNames(appShell, ['dependencies']).has('@nebula-studio/shell-protocol')
) {
  fail('app-shell must depend on @nebula-studio/shell-protocol');
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
if (!runtime?.dependencies?.['@nebula-studio/shell-protocol']) {
  fail('runtime must depend on @nebula-studio/shell-protocol');
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
