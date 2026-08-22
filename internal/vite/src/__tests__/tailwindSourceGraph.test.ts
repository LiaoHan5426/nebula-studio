import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { findMonorepoRoot } from '../config/windowsManifest.ts';
import {
  isRepoWideTailwindSourceCss,
  resolveTailwindSourceGraph,
} from '../styles/resolveTailwindSourceGraph.ts';

const repoRoot = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));

describe('resolveTailwindSourceGraph', () => {
  it('does not scan the whole packages/ or apps/ trees', () => {
    const graph = resolveTailwindSourceGraph(join(repoRoot, 'apps/web'));
    expect(graph.sources.map((s) => s.repoRelativeDir)).not.toContain(
      'packages',
    );
    expect(graph.sources.map((s) => s.repoRelativeDir)).not.toContain('apps');
    expect(
      graph.sources.some((s) => s.repoRelativeDir === 'apps/web/src'),
    ).toBe(true);
  });

  it('keeps Docs Remote sources free of Integration app source', () => {
    const graph = resolveTailwindSourceGraph(
      join(repoRoot, 'apps/sub-web/docs'),
    );
    const dirs = graph.sources.map((s) => s.repoRelativeDir);
    expect(dirs).toContain('apps/sub-web/docs/src');
    expect(dirs.some((dir) => dir.startsWith('apps/sub-web/integration'))).toBe(
      false,
    );
    expect(dirs.some((dir) => dir.startsWith('apps/sub-web/settings'))).toBe(
      false,
    );
  });

  it('shared theme.css must not declare repo-wide @source', () => {
    const css = readFileSync(
      join(repoRoot, 'tools/tailwindcss/src/theme.css'),
      'utf8',
    );
    expect(isRepoWideTailwindSourceCss(css)).toBe(false);
    expect(css).not.toContain("@source '../../../packages/'");
    expect(css).not.toContain("@source '../../../apps/'");
  });
});
