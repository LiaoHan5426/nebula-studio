import type { NebulaManualChunkRule } from '../types.ts';
import { nebulaChunkNormalizeId } from '../pathUtils.ts';

/** 其余 `node_modules` 依赖，避免全部挤进单一 entry chunk。 */
export const nebulaChunkRuleVendorMisc: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/node_modules/')) return 'vendor-misc';
};
