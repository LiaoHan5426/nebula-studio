import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const electronRoot = fileURLToPath(new URL('..', import.meta.url));
const src = path.resolve(electronRoot, '../docs/dist-web');
const dest = path.resolve(electronRoot, 'out/renderer/docs');

await fs.rm(dest, { recursive: true, force: true });
await fs.cp(src, dest, { recursive: true });
