import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(
  scriptDir,
  '../apps/sub-web/integration/src/shared/api/consoleApi.ts',
);
const featuresDir = join(scriptDir, '../apps/sub-web/integration/src/features');

const DOMAIN_MAP = {
  subscriptionApi: 'subscription',
  subscriptionRequestApi: 'subscription',
  tenantApi: 'tenant',
  pluginApi: 'plugin',
  pluginCatalogApi: 'plugin',
  monitorApi: 'monitor',
  governanceApi: 'governance',
  governancePolicyApi: 'governance',
  dagApi: 'monitor',
  resourceApi: 'governance',
  approvalApi: 'approval',
  versionApi: 'version',
  releaseApi: 'release',
};

const source = readFileSync(sourcePath, 'utf8');
const importBlock = source.split('export const subscriptionApi')[0].trim();

const exportRe = /export const (\w+) = \{[\s\S]*?\n\};/g;
const blocks = [...source.matchAll(exportRe)];

const byDomain = new Map();
for (const match of blocks) {
  const name = match[1];
  const domain = DOMAIN_MAP[name];
  if (!domain) {
    throw new Error(`No domain mapping for ${name}`);
  }
  const list = byDomain.get(domain) ?? [];
  list.push({ name, code: match[0] });
  byDomain.set(domain, list);
}

for (const [domain, exports] of byDomain.entries()) {
  const dir = join(featuresDir, domain);
  mkdirSync(dir, { recursive: true });
  const body = exports.map((entry) => entry.code).join('\n\n');
  const file = join(dir, 'api.ts');
  writeFileSync(file, `${importBlock}\n\n${body}\n`, 'utf8');
  console.log(`Wrote ${domain}/api.ts (${exports.length} exports)`);
}

const reexports = [...byDomain.keys()]
  .toSorted()
  .map(
    (domain) =>
      `export { ${[...byDomain.get(domain)].map((e) => e.name).join(', ')} } from '@/features/${domain}/api';`,
  )
  .join('\n');

writeFileSync(
  sourcePath,
  `${importBlock.split('\n').slice(0, 3).join('\n')}\n\n/**\n * @deprecated Import domain APIs from @/features/<domain>/api directly.\n * Scheduled for removal after migration wave 2.\n */\n${reexports}\n`,
  'utf8',
);

console.log('Updated consoleApi.ts re-export shim');
