declare module 'virtual:nebula-app-manifest' {
  export interface NebulaAppManifest {
    subApps: string[];
    windowIds: string[];
    preloadIds: string[];
    embedSurfaces: string[];
    embedBootEntries: Record<string, string>;
  }

  export const nebulaAppManifest: NebulaAppManifest;
  export const nebulaSubApps: string[];
  export const nebulaWindowIds: string[];
  export const nebulaPreloadIds: string[];
  export const nebulaEmbedSurfaces: string[];
  export const nebulaEmbedBootEntries: Record<string, string>;
  export default nebulaAppManifest;
}
