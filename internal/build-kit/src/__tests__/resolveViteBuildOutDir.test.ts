import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveViteBuildOutDir } from '../plugin/nebulaTailwindSourcePlugin.ts';

describe('resolveViteBuildOutDir', () => {
  it('keeps an absolute electron-vite outDir instead of joining onto root', () => {
    const root = resolve('/apps/electron/src/renderer');
    const outDir = resolve('/apps/electron/out/renderer');
    const resolved = resolveViteBuildOutDir(root, outDir);
    expect(resolved).toBe(outDir);
    expect(resolved.startsWith(root)).toBe(false);
  });

  it('resolves a relative Vite outDir against the config root', () => {
    const root = resolve('repo', 'apps', 'web');
    expect(resolveViteBuildOutDir(root, 'dist')).toBe(join(root, 'dist'));
  });
});
