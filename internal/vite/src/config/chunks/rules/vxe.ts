import type { NebulaManualChunkRule } from '../types.ts';
import {
  nebulaChunkIsFromNodeModulePackage,
  nebulaChunkNormalizeId,
} from '../pathUtils.ts';

export const nebulaChunkRuleVxe: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (
    nebulaChunkIsFromNodeModulePackage(n, 'vxe-table') ||
    nebulaChunkIsFromNodeModulePackage(n, 'xe-utils')
  ) {
    return 'vendor-vxe';
  }
};
