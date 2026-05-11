/// <reference types="vite/client" />
import type { ElectronAPI } from '@electron-toolkit/preload';

/** 与 `electron.vite.config.ts` 中 `define` 一致，供 `boot` 拉起的子应用（如 docs）使用 */
declare const __NEBULA_BUILD_NODE_VERSION__: string;

/** 供 `tsconfig.renderer` 下分析 `boot` 所动态加载的各子应用时，与 preload 中 `contextBridge` 一致 */
declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
  }
}
