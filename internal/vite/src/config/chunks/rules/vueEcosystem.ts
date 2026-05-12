import type { NebulaManualChunkRule } from '../types.ts';
import {
  nebulaChunkIsFromNodeModulePackage,
  nebulaChunkNormalizeId,
} from '../pathUtils.ts';

export const nebulaChunkRuleVueEcosystem: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (!n.includes('/node_modules/')) return;

  if (
    nebulaChunkIsFromNodeModulePackage(n, 'vue') ||
    n.includes('/node_modules/@vue/') ||
    nebulaChunkIsFromNodeModulePackage(n, 'vue-router') ||
    nebulaChunkIsFromNodeModulePackage(n, 'pinia') ||
    nebulaChunkIsFromNodeModulePackage(n, 'vuedraggable')
  ) {
    return 'vendor-vue';
  }
};
