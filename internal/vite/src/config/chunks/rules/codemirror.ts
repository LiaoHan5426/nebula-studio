import type { NebulaManualChunkRule } from '../types.ts';
import {
  nebulaChunkIsFromNodeModulePackage,
  nebulaChunkNormalizeId,
} from '../pathUtils.ts';

export const nebulaChunkRuleCodemirror: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (
    nebulaChunkIsFromNodeModulePackage(n, 'codemirror') ||
    n.includes('/node_modules/@codemirror/')
  ) {
    return 'vendor-codemirror';
  }
};
