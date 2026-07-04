import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPackageSync } from '@nebula-studio-internal/node';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsPkg = getPackageSync('@nebula-studio-renderer/docs-site', scriptDir);
if (docsPkg === undefined) {
  throw new Error(
    '[copy-docs-site] Workspace package @nebula-studio-renderer/docs-site not found',
  );
}

const electronRoot = fileURLToPath(new URL('..', import.meta.url));
const src = path.join(docsPkg.dir, '.vitepress', 'dist');
const dest = path.resolve(electronRoot, 'out/renderer/docs');

await fs.rm(dest, { recursive: true, force: true });
await fs.cp(src, dest, { recursive: true });
