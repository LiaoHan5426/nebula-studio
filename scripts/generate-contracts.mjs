#!/usr/bin/env node
/**
 * 从 platform-console OpenAPI 生成 TypeScript 契约。
 * 用法:
 *   node scripts/generate-contracts.mjs
 *   node scripts/generate-contracts.mjs --url=<openapi-url>
 *   node scripts/generate-contracts.mjs --strict --url=<openapi-url>
 *   node scripts/generate-contracts.mjs --file=packages/contracts/generated/openapi.json
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, '..');
const outDir = join(root, 'packages/contracts/generated');
const windowsConfigPath = join(root, 'configs/windows.json');
const fileArg = process.argv.find((a) => a.startsWith('--file='))?.slice(7);
const strict = process.argv.includes('--strict');

function joinOrigin(origin, path = '/') {
  const base = String(origin).replace(/\/$/, '');
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveDefaultOpenApiUrl() {
  const config = JSON.parse(readFileSync(windowsConfigPath, 'utf8'));
  const spec = config.realStack?.openapi?.platform;
  const target = spec?.target ? config.apiTargets?.[spec.target] : undefined;
  if (!spec || !target) {
    throw new Error(
      'Missing realStack.openapi.platform or referenced apiTargets entry in configs/windows.json',
    );
  }
  return joinOrigin(target, spec.path);
}

const apiDocsUrl =
  process.argv.find((a) => a.startsWith('--url='))?.slice(6) ??
  process.env.NEBULA_OPENAPI_URL ??
  resolveDefaultOpenApiUrl();
const outFile = join(outDir, 'platform-api.ts');

mkdirSync(outDir, { recursive: true });

let spec;
if (fileArg) {
  const specPath = join(root, fileArg);
  console.log(`Loading OpenAPI from file ${specPath} ...`);
  spec = JSON.parse(readFileSync(specPath, 'utf8'));
} else {
  console.log(`Fetching OpenAPI from ${apiDocsUrl} ...`);
  const res = await fetch(apiDocsUrl);
  if (!res.ok) {
    if (strict) {
      console.error(`Failed to fetch OpenAPI: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    const fallback = join(outDir, 'openapi.json');
    console.warn(`Fetch failed (${res.status}); trying fallback ${fallback}`);
    try {
      spec = JSON.parse(readFileSync(fallback, 'utf8'));
    } catch {
      console.error(`Failed to fetch OpenAPI: ${res.status} ${res.statusText}`);
      console.error(
        'Ensure platform-console is running at configs/windows.json realStack.openapi.platform, pass --url=, or --file=',
      );
      process.exit(1);
    }
  } else {
    spec = await res.json();
  }
}

const specFile = join(outDir, 'openapi.json');
writeFileSync(specFile, `${JSON.stringify(spec, null, 2)}\n`);

console.log('Running openapi-typescript ...');
execFileSync('vp', ['exec', 'openapi-typescript', specFile, '-o', outFile], {
  cwd: root,
  stdio: 'inherit',
});

writeFileSync(
  join(outDir, 'index.ts'),
  `/** Auto-generated export surface. Run: vp run generate:contracts */\nexport type {\n  PlatformApiComponents,\n  PlatformApiOperation,\n  PlatformApiOperationId,\n  PlatformApiOperations,\n  PlatformApiPath,\n  PlatformApiPaths,\n} from './facade.ts';\n\nexport {\n  GENERATED_API_BASES,\n  GENERATED_API_TARGETS,\n} from './api-namespaces.ts';\nexport type {\n  GeneratedApiNamespace,\n  GeneratedApiTarget,\n} from './api-namespaces.ts';\n`,
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
