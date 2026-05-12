import type { NebulaManualChunkRule } from '../types.ts';
import {
  nebulaChunkIsFromNodeModulePackage,
  nebulaChunkNormalizeId,
} from '../pathUtils.ts';

export const nebulaChunkRuleMarkdown: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (
    nebulaChunkIsFromNodeModulePackage(n, 'highlight.js') ||
    nebulaChunkIsFromNodeModulePackage(n, 'marked')
  ) {
    return 'vendor-markdown';
  }
};
