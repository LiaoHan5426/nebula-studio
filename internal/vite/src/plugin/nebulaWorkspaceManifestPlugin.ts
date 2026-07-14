import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import {
  buildAppManifest,
  findMonorepoRoot,
  loadWindowsConfig,
} from '../config/windowsManifest.ts';
import type { NebulaAppManifest } from '../config/windowsManifest.ts';

export const NEBULA_APP_MANIFEST_VIRTUAL_ID = 'virtual:nebula-app-manifest';
const RESOLVED_MANIFEST_ID = `\0${NEBULA_APP_MANIFEST_VIRTUAL_ID}`;

let cachedManifest: NebulaAppManifest | null = null;

export function getNebulaAppManifest(rootDir?: string): NebulaAppManifest {
  if (cachedManifest) return cachedManifest;
  const root = rootDir ?? findMonorepoRoot(process.cwd());
  cachedManifest = buildAppManifest(loadWindowsConfig(root), root);
  return cachedManifest;
}

function serializeManifest(manifest: NebulaAppManifest): string {
  return `export const nebulaAppManifest = ${JSON.stringify(manifest, null, 2)};

export const nebulaSubApps = nebulaAppManifest.subApps;
export const nebulaWindowIds = nebulaAppManifest.windowIds;
export const nebulaPreloadIds = nebulaAppManifest.preloadIds;
export const nebulaEmbedSurfaces = nebulaAppManifest.embedSurfaces;
export const nebulaEmbedBootEntries = nebulaAppManifest.embedBootEntries;

export default nebulaAppManifest;
`;
}

export interface NebulaWorkspaceManifestPluginOptions {
  /** Monorepo root; auto-detected when omitted. */
  rootDir?: string;
}

/**
 * Reads configs/windows.json and exposes `virtual:nebula-app-manifest`.
 * Validates renderer boot/main entries exist; throws on invalid configuration.
 */
export function nebulaWorkspaceManifestPlugin(
  options: NebulaWorkspaceManifestPluginOptions = {},
): Plugin {
  let rootDir = options.rootDir ?? findMonorepoRoot(process.cwd());

  return {
    name: 'nebula-workspace-manifest',
    enforce: 'pre',
    config(config) {
      rootDir =
        options.rootDir ?? findMonorepoRoot(config.root ?? process.cwd());
      cachedManifest = buildAppManifest(loadWindowsConfig(rootDir), rootDir);
    },
    resolveId(source) {
      if (source === NEBULA_APP_MANIFEST_VIRTUAL_ID) {
        return RESOLVED_MANIFEST_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_MANIFEST_ID) return null;
      const manifest = getNebulaAppManifest(rootDir);
      return serializeManifest(manifest);
    },
  };
}

export function resolveSubAppRoot(configModuleUrl: string | URL): {
  root: string;
  appDir: string;
} {
  const appDir = fileURLToPath(new URL('.', configModuleUrl));
  return { root: appDir, appDir };
}
