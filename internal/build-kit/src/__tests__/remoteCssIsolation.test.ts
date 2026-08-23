import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const studioRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('production CSS layering', () => {
  it('federation entries import the remote CSS chain, not document preflight', () => {
    for (const rel of [
      'apps/sub-web/docs/src/federation.ts',
      'apps/sub-web/settings/src/federation.ts',
      'apps/sub-web/integration/src/federation.ts',
    ]) {
      const source = readFileSync(join(studioRoot, rel), 'utf8');
      expect(source).toContain('@nebula-studio/styles/remote');
      expect(source).not.toContain('styles/document');
      expect(source).not.toContain('tailwind/electron');
      expect(source).not.toContain(
        'document.documentElement.dataset.nebulaCss',
      );
    }
  });

  it('remote.css has no html preflight leak', () => {
    const remote = readFileSync(
      join(studioRoot, 'packages/styles/src/remote.css'),
      'utf8',
    );
    expect(remote).toContain('@nebula-studio-internal/tailwind/theme');
    expect(remote).not.toMatch(/html\s*\{/);
  });

  it('styles index puts design tokens on the tokens cascade layer', () => {
    const index = readFileSync(
      join(studioRoot, 'packages/styles/src/index.css'),
      'utf8',
    );
    expect(index).toContain('layer(tokens)');
    expect(index).toContain('layer(foundations)');
  });
});
