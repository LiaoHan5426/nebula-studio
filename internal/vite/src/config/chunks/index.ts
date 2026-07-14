import type { UserConfig } from 'vite';
import type {
  NebulaManualChunkMeta,
  NebulaManualChunkRule,
  NebulaRendererChunksOptions,
} from './types.ts';
import { nebulaChunkRuleCodemirror } from './rules/codemirror.ts';
import { nebulaChunkRuleMarkdown } from './rules/markdown.ts';
import {
  nebulaChunkRuleEditorCode,
  nebulaChunkRuleEditorFlow,
  nebulaChunkRuleIntegrationDomain,
  nebulaChunkRuleShellCore,
  nebulaChunkRuleUiCore,
  nebulaChunkRuleElectronShared,
} from './rules/domainChunks.ts';
import { nebulaChunkRuleNebulaWorkspace } from './rules/nebulaWorkspace.ts';
import { nebulaChunkRuleVendorMisc } from './rules/vendorMisc.ts';
import { nebulaChunkRuleVueEcosystem } from './rules/vueEcosystem.ts';
import { nebulaChunkRuleVxe } from './rules/vxe.ts';
import { nebulaChunkRuleWangeditor } from './rules/wangeditor.ts';

/**
 * 默认拆分顺序：先重型依赖，再 Vue 生态与 Monorepo，最后兜底 vendor。
 * 应用可通过 `chunks.extraRules` 插到该列表**前面**。
 */
export const NEBULA_DEFAULT_MANUAL_CHUNK_RULES: readonly NebulaManualChunkRule[] =
  [
    nebulaChunkRuleWangeditor,
    nebulaChunkRuleEditorCode,
    nebulaChunkRuleCodemirror,
    nebulaChunkRuleEditorFlow,
    nebulaChunkRuleVxe,
    nebulaChunkRuleMarkdown,
    nebulaChunkRuleIntegrationDomain,
    nebulaChunkRuleShellCore,
    nebulaChunkRuleElectronShared,
    nebulaChunkRuleUiCore,
    nebulaChunkRuleVueEcosystem,
    nebulaChunkRuleNebulaWorkspace,
    nebulaChunkRuleVendorMisc,
  ];

const EMPTY_META: NebulaManualChunkMeta = {};

export function resolveNebulaManualChunks(
  options?: NebulaRendererChunksOptions,
):
  | ((id: string, meta?: NebulaManualChunkMeta) => string | undefined)
  | undefined {
  if (options?.enabled === false) return undefined;
  const extra = options?.extraRules ?? [];
  const rules: NebulaManualChunkRule[] = [
    ...extra,
    ...NEBULA_DEFAULT_MANUAL_CHUNK_RULES,
  ];
  return (id: string, meta?: NebulaManualChunkMeta) => {
    const m = meta ?? EMPTY_META;
    for (const rule of rules) {
      const name = rule(id, m);
      if (name) return name;
    }
    return undefined;
  };
}

export function nebulaRendererChunkBuildPartial(
  options?: NebulaRendererChunksOptions,
): Pick<UserConfig, 'build'> | undefined {
  const manualChunks = resolveNebulaManualChunks(options);
  if (!manualChunks) return undefined;
  return {
    build: {
      // nebula-workspace 聚合所有 workspace 包，预期超过默认 500 kB
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
}
