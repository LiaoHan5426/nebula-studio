import type { GeneratedWindowId } from './_generated-windows';

import {
  GENERATED_DISPLAY_ORDER,
  GENERATED_ELECTRON_EMBEDDED_PRESENTATION,
  GENERATED_MODAL_RENDERERS,
  GENERATED_SHELL_CONFIG,
  GENERATED_WINDOWS,
} from './_generated-windows';

export type ElectronEmbeddedPresentation = 'browser-view' | 'iframe';

/**
 * 与 Electron 壳层布局一致的**可序列化**配置（不含 `import.meta` / 主进程路径）。
 * 数据来源：`configs/windows.json` → codegen → `_generated-windows.ts`。
 * `apps/electron/app.config.ts` 应从此处展开，保证 Web 多页构建与桌面版同源。
 */
export const shellPresentationConfig = {
  shell: GENERATED_SHELL_CONFIG,
  electronEmbeddedPresentation:
    GENERATED_ELECTRON_EMBEDDED_PRESENTATION satisfies ElectronEmbeddedPresentation,
  windows: GENERATED_WINDOWS,
} as const;

/** 弹窗渲染器（login 等），同源来自 `configs/windows.json` */
export const modalRenderersConfig = GENERATED_MODAL_RENDERERS;

/** 应用集成面板展示顺序已迁出 `windows.json`；生成物保留空数组以兼容旧 import */
export const displayOrderConfig = GENERATED_DISPLAY_ORDER;

export type ShellWindowId = GeneratedWindowId;

export type EmbeddedShellWindowId = Exclude<ShellWindowId, 'main'>;

export function getEmbeddedShellWindowIds(): EmbeddedShellWindowId[] {
  return (Object.keys(GENERATED_WINDOWS) as ShellWindowId[]).filter(
    (id): id is EmbeddedShellWindowId => id !== 'main',
  );
}

export function isElectronIframeEmbedPresentation(): boolean {
  return shellPresentationConfig.electronEmbeddedPresentation === 'iframe';
}

// Re-export generated types for downstream consumers
export type {
  GeneratedModalRendererEntry,
  GeneratedWindowEntry,
} from './_generated-windows';
