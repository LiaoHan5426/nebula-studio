import {
  GENERATED_SHELL_CONFIG,
  GENERATED_ELECTRON_EMBEDDED_PRESENTATION,
  GENERATED_WINDOWS,
  GENERATED_MODAL_RENDERERS,
  GENERATED_DISPLAY_ORDER,
} from './_generated-windows';
import type { GeneratedWindowId } from './_generated-windows';

export type ElectronEmbeddedPresentation = 'iframe' | 'browser-view';

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

/** 应用集成面板展示顺序，同源来自 `configs/windows.json` 的 `displayOrder` */
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

/** 与 `apps/web` 中 `web-boot` 使用的查询参数一致，用于 iframe `index.html?…` */
export const WEB_SHELL_EMBED_QUERY = 'embed' as const;

// Re-export generated types for downstream consumers
export type {
  GeneratedWindowEntry,
  GeneratedModalRendererEntry,
} from './_generated-windows';
