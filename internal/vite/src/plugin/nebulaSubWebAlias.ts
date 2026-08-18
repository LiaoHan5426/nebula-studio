import type { Plugin } from 'vite';

import path from 'node:path';

const SUB_WEB_SEGMENT = `${path.sep}sub-web${path.sep}`;

function subWebSrcRootFromImporter(importer: string): null | string {
  const normalized = path.normalize(importer);
  const idx = normalized.indexOf(SUB_WEB_SEGMENT);
  if (idx === -1) return null;

  const after = normalized.slice(idx + SUB_WEB_SEGMENT.length);
  const pkgName = after.split(path.sep)[0];
  if (!pkgName) return null;

  return path.join(normalized.slice(0, idx), 'sub-web', pkgName, 'src');
}

export function splitImportQuery(source: string): {
  query: string;
  specifier: string;
} {
  const idx = source.indexOf('?');
  if (idx === -1) {
    return { specifier: source, query: '' };
  }
  return {
    specifier: source.slice(0, idx),
    query: source.slice(idx),
  };
}

function isDemoQuery(query: string): boolean {
  return query === '?demo' || query.startsWith('?demo&');
}

/**
 * Electron renderer 从 `apps/sub-web/<pkg>` 动态加载子应用时，
 * 按 importer 所在包解析 `@/` → `<pkg>/src`（与各 sub-web vite.config 一致）。
 */
export function nebulaSubWebAliasPlugin(): Plugin {
  return {
    name: 'nebula-sub-web-alias',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('@/') || !importer) return null;

      const { specifier, query } = splitImportQuery(source);
      // `?demo` 必须交给 nebulaVueDemoPlugin，不能在这里解析成裸 .vue（否则 Demo 拿不到 component/source）。
      if (isDemoQuery(query)) return null;

      const srcRoot = subWebSrcRootFromImporter(importer);
      if (!srcRoot) return null;

      const target = path.join(srcRoot, specifier.slice(2));
      const resolved = await this.resolve(target, importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved) return null;

      const resolvedId = typeof resolved === 'string' ? resolved : resolved.id;
      if (!query) return resolvedId;
      return resolvedId.includes('?') ? resolvedId : `${resolvedId}${query}`;
    },
  };
}
