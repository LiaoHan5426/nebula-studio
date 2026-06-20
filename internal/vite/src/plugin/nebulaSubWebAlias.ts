import path from 'node:path';
import type { Plugin } from 'vite';

const SUB_WEB_SEGMENT = `${path.sep}sub-web${path.sep}`;

function subWebSrcRootFromImporter(importer: string): string | null {
  const normalized = path.normalize(importer);
  const idx = normalized.indexOf(SUB_WEB_SEGMENT);
  if (idx === -1) return null;

  const after = normalized.slice(idx + SUB_WEB_SEGMENT.length);
  const pkgName = after.split(path.sep)[0];
  if (!pkgName) return null;

  return path.join(normalized.slice(0, idx), 'sub-web', pkgName, 'src');
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

      const srcRoot = subWebSrcRootFromImporter(importer);
      if (!srcRoot) return null;

      const target = path.join(srcRoot, source.slice(2));
      const resolved = await this.resolve(target, importer, {
        ...options,
        skipSelf: true,
      });
      return resolved?.id ?? null;
    },
  };
}
