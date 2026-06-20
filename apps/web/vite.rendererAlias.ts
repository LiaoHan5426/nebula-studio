import path from 'node:path';
import type { Plugin } from 'vite';

export interface RendererAliasMapping {
  /** Unique segment in the importer path (normalized to `/`). */
  marker: string;
  src: string;
}

/**
 * Web 宿主同时打包 shell 与多个 embed renderer；各子包均用 `@/` 指向自身 `src`。
 * 按 importer 所在 renderer 目录解析，避免单一 `@` 别名冲突。
 */
export function createRendererAliasPlugin(
  mappings: RendererAliasMapping[],
): Plugin {
  return {
    name: 'nebula-renderer-alias',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('@/') || !importer) {
        return null;
      }
      const normalizedImporter = importer.replace(/\\/g, '/');
      for (const { marker, src } of mappings) {
        if (normalizedImporter.includes(marker)) {
          const candidate = path.join(src, source.slice(2));
          const resolved = await this.resolve(candidate, importer, {
            ...options,
            skipSelf: true,
          });
          return resolved ?? candidate;
        }
      }
      return null;
    },
  };
}
