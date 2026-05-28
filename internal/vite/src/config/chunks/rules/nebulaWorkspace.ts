import type { NebulaManualChunkRule } from '../types.ts';
import { nebulaChunkNormalizeId } from '../pathUtils.ts';

/**
 * 工作区源码与 `@nebula-studio/*` 包（含 pnpm 解析路径），与通用 vendor 分离便于缓存与排查。
 */
export const nebulaChunkRuleNebulaWorkspace: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/@nebula-studio/')) return 'nebula-workspace';
  if (n.includes('/@nebula-studio-electron/')) return 'nebula-workspace';
  if (n.includes('/packages/nebula-ui/')) return 'nebula-workspace';
  if (n.includes('/packages/app-shell/')) return 'nebula-workspace';
  if (n.includes('/packages/styles/')) return 'nebula-workspace';
  if (n.includes('/packages/electron-shared')) return 'nebula-workspace';
};
