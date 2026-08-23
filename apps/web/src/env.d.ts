// / <reference types="vite/client" />
// / <reference types="@nebula-studio/types/sub-web" />

import type { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      auth: {
        establishSession(payload: {
          roles?: string[];
          token: string;
          user: string;
          userId?: string;
        }): Promise<boolean>;
        getSession(): Promise<null | {
          roles?: string[];
          token?: string;
          user: string;
          userId?: string;
        }>;
        login(payload: {
          password: string;
          user: string;
        }): Promise<{ ok: true; user: string }>;
        logout(): Promise<boolean | void>;
      };
      shell: {
        openLogin(): Promise<boolean | void>;
      };
    };
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
