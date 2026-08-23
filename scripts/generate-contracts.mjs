#!/usr/bin/env node
/**
 * 从 platform-console OpenAPI 生成 TypeScript 契约。
 * 用法:
 *   node scripts/generate-contracts.mjs
 *   node scripts/generate-contracts.mjs --url=<openapi-url>
 *   node scripts/generate-contracts.mjs --strict --snapshot-on-unauthorized
 *   node scripts/generate-contracts.mjs --file=packages/contracts/generated/openapi.json
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ensureFrontendApplicationOpenApi } from '@nebula-studio-internal/node-kit/frontend-openapi';
import { joinOrigin } from '@nebula-studio-internal/node-kit/join-origin';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, '..');
const outDir = join(root, 'packages/contracts/generated');
const environmentsConfigPath = join(root, 'configs/environments.json');
const realStackConfigPath = join(root, 'configs/real-stack.json');
const fileArg = process.argv.find((a) => a.startsWith('--file='))?.slice(7);
const strict = process.argv.includes('--strict');
const snapshotOnUnauthorized =
  process.argv.includes('--snapshot-on-unauthorized') ||
  process.env.NEBULA_OPENAPI_SNAPSHOT_ON_UNAUTHORIZED === 'true';

function resolveDefaultOpenApiUrl() {
  const environments = JSON.parse(readFileSync(environmentsConfigPath, 'utf8'));
  const realStack = JSON.parse(readFileSync(realStackConfigPath, 'utf8'));
  const spec = realStack.openapi?.platform;
  const target = spec?.target
    ? environments.apiTargets?.[spec.target]
    : undefined;
  if (!spec || !target) {
    throw new Error(
      'Missing real-stack.openapi.platform or referenced apiTargets entry in split configs',
    );
  }
  return joinOrigin(target, spec.path);
}

const apiDocsUrl =
  process.argv.find((a) => a.startsWith('--url='))?.slice(6) ??
  process.env.NEBULA_OPENAPI_URL ??
  resolveDefaultOpenApiUrl();
const specFile = join(outDir, 'openapi.json');
const outFile = join(outDir, 'platform-api.ts');

function loadSnapshotSpec(reason) {
  if (!existsSync(specFile)) {
    throw new Error(`OpenAPI snapshot missing at ${specFile} (${reason})`);
  }
  console.warn(`${reason}; using checked-in ${specFile}`);
  return JSON.parse(readFileSync(specFile, 'utf8'));
}

async function fetchLiveSpec(url) {
  const res = await fetch(url);
  if (res.ok) {
    return await res.json();
  }
  const status = `${res.status} ${res.statusText}`.trim();
  const unauthorized = res.status === 401 || res.status === 403;
  if (unauthorized && snapshotOnUnauthorized) {
    return loadSnapshotSpec(`Failed to fetch OpenAPI: ${status}`);
  }
  if (!strict) {
    console.warn(`Fetch failed (${res.status}); trying fallback ${specFile}`);
    try {
      return JSON.parse(readFileSync(specFile, 'utf8'));
    } catch {
      throw new Error(
        `Failed to fetch OpenAPI: ${status}. Ensure platform-console is running at configs/windows.json realStack.openapi.platform, pass --url=, or --file=`,
      );
    }
  }
  throw new Error(`Failed to fetch OpenAPI: ${status}`);
}

mkdirSync(outDir, { recursive: true });

let spec;
if (fileArg) {
  const specPath = join(root, fileArg);
  console.log(`Loading OpenAPI from file ${specPath} ...`);
  spec = JSON.parse(readFileSync(specPath, 'utf8'));
} else {
  console.log(`Fetching OpenAPI from ${apiDocsUrl} ...`);
  spec = await fetchLiveSpec(apiDocsUrl);
}

spec = ensureFrontendApplicationOpenApi(spec);

writeFileSync(specFile, `${JSON.stringify(spec, null, 2)}\n`);

console.log('Running openapi-typescript ...');
execFileSync('vp', ['exec', 'openapi-typescript', specFile, '-o', outFile], {
  cwd: root,
  stdio: 'inherit',
});

writeFileSync(
  join(outDir, 'index.ts'),
  `/** Auto-generated export surface. Run: vp run generate:contracts */\nexport type {\n  GeneratedFrontendRuntimeEntryView,\n  PlatformApiComponents,\n  PlatformApiOperation,\n  PlatformApiOperationId,\n  PlatformApiOperations,\n  PlatformApiPath,\n  PlatformApiPaths,\n} from './facade.ts';\n\nexport {\n  GENERATED_API_NAMESPACES,\n  GENERATED_API_TARGETS,\n  GENERATED_FEDERATION_DEV_ENTRIES,\n  GENERATED_STANDALONE_APPS,\n} from './api-namespaces.ts';\nexport type { GeneratedApiTarget } from './api-namespaces.ts';\n`,
);
execFileSync(
  'vp',
  ['fmt', specFile, outFile, join(outDir, 'index.ts'), '--write'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
console.log(`Generated: ${outFile}`);
