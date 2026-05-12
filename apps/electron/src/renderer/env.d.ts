/// <reference types="vite/client" />
import type { ElectronAPI } from '@electron-toolkit/preload';

/** 供 `tsconfig.renderer` 下分析 `boot` 所动态加载的各子应用时，与 preload 中 `contextBridge` 一致 */
declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
  }
}
