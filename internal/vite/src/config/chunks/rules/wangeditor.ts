import type { NebulaManualChunkRule } from '../types.ts';
import {
  nebulaChunkIsFromNodeModulePackage,
  nebulaChunkNormalizeId,
} from '../pathUtils.ts';

export const nebulaChunkRuleWangeditor: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (
    nebulaChunkIsFromNodeModulePackage(n, '@wangeditor/editor') ||
    nebulaChunkIsFromNodeModulePackage(n, '@wangeditor/editor-for-vue')
  ) {
    return 'vendor-wangeditor';
  }
};
