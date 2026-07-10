#!/usr/bin/env node
/**
 * 从 platform-console OpenAPI 生成 TypeScript 契约。
 * 用法: node scripts/generate-contracts.mjs [--url=http://localhost:8090/v3/api-docs]
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, '..');
const outDir = join(root, 'packages/contracts/generated');
const apiDocsUrl =
  process.argv.find((a) => a.startsWith('--url='))?.slice(6) ??
  process.env.NEBULA_OPENAPI_URL ??
  'http://localhost:8090/v3/api-docs';
const outFile = join(outDir, 'platform-api.ts');

mkdirSync(outDir, { recursive: true });

console.log(`Fetching OpenAPI from ${apiDocsUrl} ...`);
const res = await fetch(apiDocsUrl);
if (!res.ok) {
  console.error(`Failed to fetch OpenAPI: ${res.status} ${res.statusText}`);
  console.error('Ensure platform-console is running on :8090, or pass --url=');
  process.exit(1);
}
const spec = await res.json();
const specFile = join(outDir, 'openapi.json');
writeFileSync(specFile, JSON.stringify(spec, null, 2));

console.log('Running openapi-typescript ...');
execSync(`npx openapi-typescript "${specFile}" -o "${outFile}"`, {
  cwd: root,
  stdio: 'inherit',
});

writeFileSync(
  join(outDir, 'index.ts'),
  `/** Auto-generated from platform-console OpenAPI. Run: vp run generate:contracts */\nexport type { paths, components, operations } from './platform-api';\n`,
);
console.log(`Generated: ${outFile}`);
