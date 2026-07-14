import type { NebulaManualChunkRule } from '../types.ts';
import { nebulaChunkNormalizeId } from '../pathUtils.ts';

/**
 * Residual workspace packages not covered by domain-specific chunk rules.
 */
export const nebulaChunkRuleNebulaWorkspace: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/@nebula-studio/')) return 'nebula-shared';
  if (n.includes('/packages/core/')) return 'nebula-shared';
  if (n.includes('/packages/features/')) return 'nebula-shared';
  if (n.includes('/packages/editors/')) return 'nebula-shared';
};
