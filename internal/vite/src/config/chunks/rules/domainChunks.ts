import type { NebulaManualChunkRule } from '../types.ts';
import { nebulaChunkNormalizeId } from '../pathUtils.ts';

export const nebulaChunkRuleShellCore: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/packages/core/app-shell/')) return 'shell-core';
  if (n.includes('/packages/core/runtime/')) return 'shell-core';
  if (n.includes('/packages/core/auth-provider/')) return 'shell-core';
  if (n.includes('/packages/core/auth/')) return 'shell-core';
  if (n.includes('/packages/core/shell/')) return 'shell-core';
};

export const nebulaChunkRuleUiCore: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/packages/ui/nebula-ui/')) return 'ui-core';
  if (n.includes('/packages/ui/nebula-layout/')) return 'ui-core';
  if (n.includes('/packages/styles/')) return 'ui-core';
};

export const nebulaChunkRuleEditorCode: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/packages/editors/code-editor/')) return 'editor-code';
  if (n.includes('/@codemirror/') || n.includes('/codemirror/'))
    return 'editor-code';
};

export const nebulaChunkRuleEditorFlow: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/packages/editors/dag-editor/')) return 'editor-flow';
  if (n.includes('/packages/editors/flow-editor/')) return 'editor-flow';
  if (n.includes('/@vue-flow/')) return 'editor-flow';
};

export const nebulaChunkRuleIntegrationDomain: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/apps/sub-web/integration/src/features/'))
    return 'integration-domain';
};

export const nebulaChunkRuleElectronShared: NebulaManualChunkRule = (id) => {
  const n = nebulaChunkNormalizeId(id);
  if (n.includes('/packages/core/electron-shared')) return 'shell-core';
  if (n.includes('/@nebula-studio-electron/')) return 'shell-core';
};
