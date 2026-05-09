/**
 * - `main`：整体 Electron **底座**（壳层 BrowserWindow，仅加载 shell renderer，**不使用 webview**）。
 * - 其余窗口键（如 `docs`）：在底座内以 **BrowserView** 展示对应子应用 renderer（类 wujie：壳层 + 内嵌内容区）。
 *
 * Preload：`apps/electron-preload/<slug>` → `@nebula-studio-preload/<slug>`
 * Renderer 源码：`apps/<renderer 目录>` → `@nebula-studio-renderer/<窗口键>`
 *
 * 壳层与子应用共用同一套 `index.html` + `?renderer=`（见 `src/renderer/boot.ts`）。
 */
export default {
  electron: import.meta.dirname,
  shell: {
    /** 底座顶栏高度（px），须与壳层 UI 顶栏一致；BrowserView 从该高度之下开始绘制 */
    topInsetPx: 56,
  },
  windows: {
    main: {
      preload: 'main',
      renderer: 'frontend',
    },
    docs: {
      preload: 'docs',
      renderer: 'docs',
    },
    settings: {
      preload: 'settings',
      renderer: 'settings',
    },
  },
} as const;
