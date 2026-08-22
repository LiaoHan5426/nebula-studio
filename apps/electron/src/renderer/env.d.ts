/// <reference types="vite/client" />
import type { ElectronAPI } from '@electron-toolkit/preload';

/** 供 `tsconfig.renderer` 下分析 `boot` 所动态加载的各子应用时，与 preload 中 `contextBridge` 一致 */
declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
  }
}

declare module 'virtual:nebula-app-manifest' {
  export interface NebulaAppManifest {
    subApps: string[];
    windowIds: string[];
    preloadIds: string[];
    preloadCapabilities: Record<string, string[]>;
    embedSurfaces: string[];
    embedBootEntries: Record<string, string>;
    federationSurfaces: string[];
  }

  export const nebulaAppManifest: NebulaAppManifest;
  export const nebulaSubApps: string[];
  export const nebulaWindowIds: string[];
  export const nebulaPreloadIds: string[];
  export const nebulaPreloadCapabilities: Record<string, string[]>;
  export const nebulaEmbedSurfaces: string[];
  export const nebulaEmbedBootEntries: Record<string, string>;
  export const nebulaFederationSurfaces: string[];
  export default nebulaAppManifest;
}
