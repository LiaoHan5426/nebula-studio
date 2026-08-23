import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { scanRuntimeAddressDrift } from '../runtimeAddressDrift.mjs';

function makeFixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'nebula-address-drift-'));
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolute = join(root, relativePath);
    mkdirSync(join(absolute, '..'), { recursive: true });
    writeFileSync(absolute, contents, 'utf8');
  }
  return root;
}

describe('scanRuntimeAddressDrift', () => {
  it('reports hardcoded loopback addresses', () => {
    const root = makeFixture({
      'apps/web/src/boot.ts': 'const url = "http://localhost:5173";\n',
    });
    const drift = scanRuntimeAddressDrift(root, {
      scanRoots: ['apps'],
      allowlist: [],
    });
    expect(drift.some((item) => item.includes('apps'))).toBe(true);
    expect(drift.some((item) => item.includes('boot.ts'))).toBe(true);
  });

  it('skips allowlisted files', () => {
    const root = makeFixture({
      'apps/web/src/boot.ts': 'const url = "http://127.0.0.1:8090";\n',
    });
    const drift = scanRuntimeAddressDrift(root, {
      scanRoots: ['apps'],
      allowlist: [/^apps[\\/]web[\\/]src[\\/]boot\.ts$/],
    });
    expect(drift).toEqual([]);
  });

  it('default allowlist skips test fixtures', () => {
    const root = makeFixture({
      'packages/core/app-shell/src/web/__tests__/webAuth.test.ts':
        'const url = "http://localhost:5173";\n',
    });
    const drift = scanRuntimeAddressDrift(root, {
      scanRoots: ['packages'],
    });
    expect(drift).toEqual([]);
  });
});
