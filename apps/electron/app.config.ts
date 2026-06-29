import {
  shellPresentationConfig,
  modalRenderersConfig,
} from '@nebula-studio/app-shell/shell-config';

/**
 * - `main`：整体 Electron **底座**（壳层 BrowserWindow，子应用默认以 iframe 内嵌，与 Web 一致）。
 * - 若 `electronEmbeddedPresentation` 为 `browser-view`，则在底座内以 BrowserView 展示子应用。
 *
 * Preload：`apps/electron-preload/<slug>` → `@nebula-studio-preload/<slug>`
 * Renderer 源码：`apps/<renderers>/<包名>`（见 `renderers`）→ `@nebula-studio-renderer/<窗口键>`
 *
 * 壳层与子应用共用同一套 `index.html` + `?renderer=`（见 `src/renderer/boot.ts`）。
 *
 * `shell` / `windows` / `modalRenderers` 与 Web 多页宿主同源：
 * `configs/windows.json` → codegen → `@nebula-studio/app-shell`。
 */
export default {
  electron: import.meta.dirname,
  /** 相对 `apps/`：子应用 renderer 包所在目录名（须与 `src/renderer/boot.ts` 的 glob 一致）。 */
  renderers: 'sub-web',
  ...shellPresentationConfig,
  modalRenderers: modalRenderersConfig,
} as const;
