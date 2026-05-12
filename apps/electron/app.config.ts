import { shellPresentationConfig } from '@nebula-studio/app-shell/shell-config';

/**
 * - `main`：整体 Electron **底座**（壳层 BrowserWindow，仅加载 shell renderer，**不使用 webview**）。
 * - 其余窗口键（如 `docs`）：在底座内以 **BrowserView** 展示对应子应用 renderer（类 wujie：壳层 + 内嵌内容区）。
 *
 * Preload：`apps/electron-preload/<slug>` → `@nebula-studio-preload/<slug>`
 * Renderer 源码：`apps/<renderers>/<包名>`（见 `renderers`）→ `@nebula-studio-renderer/<窗口键>`
 *
 * 壳层与子应用共用同一套 `index.html` + `?renderer=`（见 `src/renderer/boot.ts`）。
 *
 * `shell` / `windows` 与 Web 多页宿主同源：见 `@nebula-studio/app-shell`。
 */
const modalRenderers = {
  /** 独立弹窗 / 独立路由，不参与壳层应用坞 */
  login: {
    preload: 'main',
    renderer: 'login',
  },
} as const;

export default {
  electron: import.meta.dirname,
  /** 相对 `apps/`：子应用 renderer 包所在目录名（须与 `src/renderer/boot.ts` 的 glob 一致）。 */
  renderers: 'sub-web',
  ...shellPresentationConfig,
  modalRenderers,
} as const;
