import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
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

if (boot.includes('sub-web/integration/src/main.ts')) {
  console.error(
    '[check:integration-mf] Electron renderer still globs Integration main.ts; Host would keep Integration chunks',
  );
  process.exit(1);
}
if (webPackage.includes('@nebula-studio-renderer/integration')) {
  console.error(
    '[check:integration-mf] Web Host still statically depends on Integration package',
  );
  process.exit(1);
}
const federationEntry = readFileSync(
  join(root, 'apps/sub-web/integration/src/federation.ts'),
  'utf8',
);
if (
  federationEntry.includes('@nebula-studio-renderer/login') ||
  federationEntry.includes('features/auth/LoginPage')
) {
  console.error(
    '[check:integration-mf] Federation entry must not import Login UI; standalone /login mounts @nebula-studio/login-ui',
  );
  process.exit(1);
}
if (
  !windows.includes('"webLoad": "federation"') ||
  !windows.includes('"renderer": "integration"')
) {
  console.error(
    '[check:integration-mf] windows.json integration is not federation',
  );
  process.exit(1);
}
if (existsSync(join(root, 'apps/web/src/embed/integration-entry.ts'))) {
  console.error('[check:integration-mf] integration-entry.ts still exists');
  process.exit(1);
}
if (!webBoot.includes('localFederationRegistration')) {
  console.error(
    '[check:integration-mf] Web Host is not resolving Integration via federation fallbacks',
  );
  process.exit(1);
}
if (!electronFederation.includes("renderer === 'integration'")) {
  console.error(
    '[check:integration-mf] Electron Host is not loading Integration federation',
  );
  process.exit(1);
}
if (!builder.includes('remotes/integration')) {
  console.error(
    '[check:integration-mf] electron-builder.yml missing remotes/integration extraResources',
  );
  process.exit(1);
}

const hostEditorLeakPattern =
  /monaco-editor(?:-vue3)?|bpmn-js|@nebula-studio\/nebula-(?:flow-editor|dag-editor|code-editor)/;
const hostManifests = [
  join(root, 'apps/web/package.json'),
];
for (const manifestPath of hostManifests) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const deps = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };
  for (const name of Object.keys(deps)) {
    if (hostEditorLeakPattern.test(name)) {
      console.error(
        `[check:integration-mf] Host package ${manifest.name} depends on editor runtime ${name}`,
      );
      process.exit(1);
    }
  }
}

function walkFiles(directory, visit, fileTest) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, visit, fileTest);
      continue;
    }
    if (fileTest(entry.name)) visit(path);
  }
}

const hostSourceRoots = [
  join(root, 'apps/web/src'),
];
for (const sourceRoot of hostSourceRoots) {
  walkFiles(
    sourceRoot,
    (path) => {
      const source = readFileSync(path, 'utf8');
      if (hostEditorLeakPattern.test(source)) {
        console.error(
          `[check:integration-mf] Host source leaks editor runtime: ${path}`,
        );
        process.exit(1);
      }
    },
    (name) => /\.(?:ts|tsx|vue|js|mjs)$/.test(name),
  );
}

const result = spawnSync(
  'vp',
  ['run', '--filter', '@nebula-studio-renderer/integration', 'build'],
  { cwd: root, stdio: 'inherit', shell: true },
);
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const manifest = join(root, 'apps/sub-web/integration/dist/mf-manifest.json');
if (!existsSync(manifest)) {
  console.error(`[check:integration-mf] missing ${manifest}`);
  process.exit(1);
}

const remoteDist = join(root, 'apps/sub-web/integration/dist');
const remoteFiles = [];
walkFiles(
  remoteDist,
  (path) => remoteFiles.push(path),
  (name) => /\.(?:js|css|json)$/.test(name),
);
const remoteBlob = remoteFiles
  .map((path) => `${path}\n${readFileSync(path, 'utf8')}`)
  .join('\n');
const requiredRemoteAssets = [
  ['bpmn-js', /bpmn-js/],
  ['monaco-editor', /monaco-editor/],
  ['vxe-table', /vxe-table/],
  ['vue-flow', /@vue-flow|vue-flow/],
];
for (const [label, pattern] of requiredRemoteAssets) {
  if (!pattern.test(remoteBlob)) {
    console.error(
      `[check:integration-mf] Integration remote dist is missing ${label} assets`,
    );
    process.exit(1);
  }
}

console.log(
  '[check:integration-mf] Integration remote build + Host federation wiring + independent editor assets passed',
);
