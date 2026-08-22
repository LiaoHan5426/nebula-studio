import type { Plugin, ResolvedConfig } from 'vite';

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  assertTailwindSourceGraphIsolated,
  formatTailwindSourceDirectives,
  resolveTailwindSourceGraph,
} from '../styles/resolveTailwindSourceGraph.ts';
import type { TailwindSourceGraph } from '../styles/resolveTailwindSourceGraph.ts';

const THEME_CSS_SUFFIX = '/tools/tailwindcss/src/theme.css';
const REPORT_NAME = 'nebula-css-source-report.json';
const SOURCE_MARKER = '/* nebula-tailwind-sources */';

function isSharedThemeCss (id: string): boolean {
  const path = id.split('?')[0]?.replace(/\\/g, '/') ?? id;
  return path.endsWith(THEME_CSS_SUFFIX);
}

function countUtilitySelectors (css: string): number {
  const names = new Set<string>();
  const re = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) {
    names.add(match[1] ?? '');
  }
  names.delete('');
  return names.size;
}

function collectCssFiles (dir: string, acc: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCssFiles(path, acc);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.css')) {
      acc.push(path);
    }
  }
  return acc;
}

export function nebulaTailwindSourcePlugin (appRoot: string): Plugin {
  let graph: TailwindSourceGraph | undefined;
  let resolved: ResolvedConfig | undefined;

  return {
    name: 'nebula-tailwind-sources',
    enforce: 'pre',
    configResolved (config) {
      resolved = config;
      graph = resolveTailwindSourceGraph(appRoot);
      assertTailwindSourceGraphIsolated(graph);
    },
    transform (code, id) {
      if (!graph || !isSharedThemeCss(id)) {
        return;
      }
      if (code.includes(SOURCE_MARKER)) {
        return;
      }
      const directives = formatTailwindSourceDirectives(graph);
      const injected = `${SOURCE_MARKER}\n${directives}\n${code}`;
      return { code: injected, map: null };
    },
    closeBundle () {
      if (!graph || !resolved || resolved.command !== 'build') {
        return;
      }
      const outDir = join(resolved.root, resolved.build.outDir);
      mkdirSync(outDir, { recursive: true });
      const cssFiles = collectCssFiles(outDir);
      let utilitySelectorCount = 0;
      for (const file of cssFiles) {
        utilitySelectorCount += countUtilitySelectors(readFileSync(file, 'utf8'));
      }
      const report = {
        packageName: graph.packageName,
        appRoot: graph.appRoot.replace(/\\/g, '/'),
        sourceCount: graph.sources.length,
        sources: graph.sources.map((source) => ({
          packageName: source.packageName,
          dir: source.repoRelativeDir,
        })),
        cssAssetCount: cssFiles.length,
        utilitySelectorCount,
      };
      writeFileSync(join(outDir, REPORT_NAME), `${JSON.stringify(report, null, 2)}\n`);
    },
  };
}
