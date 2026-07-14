import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface WindowsConfig {
  shell?: { topInsetPx?: number };
  electronEmbeddedPresentation?: 'iframe' | 'browser-view';
  apiBases?: Record<string, string>;
  apiTargets?: Record<string, string>;
  rendererSources?: Record<string, string>;
  windows: Record<
    string,
    {
      preload: string;
      renderer: string;
      label: string;
      integratable?: boolean;
      defaultEnabled?: boolean;
      requiresAuth?: boolean;
      preloadCapabilities?: string[];
      iconSvg?: string;
    }
  >;
  modalRenderers?: Record<
    string,
    {
      preload: string;
      renderer: string;
      preloadCapabilities?: string[];
    }
  >;
  displayOrder?: string[];
}

export interface NebulaAppManifest {
  /** Unique renderer package directory names under apps/sub-web */
  subApps: string[];
  /** Window IDs from configs/windows.json */
  windowIds: string[];
  /** Unique preload IDs used by windows and modal renderers */
  preloadIds: string[];
  /** Surfaces available for ?embed= query in Web shell */
  embedSurfaces: string[];
  /** Map embed surface → relative boot entry path from apps/web/src */
  embedBootEntries: Record<string, string>;
}

const DEFAULT_EMBED_BOOT_ENTRIES: Record<string, string> = {
  settings: './embed/settings-entry.js',
  login: './embed/login-entry.js',
  docs: './embed/docs-entry.js',
  integration: './embed/integration-entry.js',
};

export function findMonorepoRoot(fromDir: string): string {
  let current = fromDir;
  while (true) {
    if (
      existsSync(join(current, 'pnpm-workspace.yaml')) ||
      existsSync(join(current, 'pnpm-lock.yaml'))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(
        `[nebula-vite] Cannot find monorepo root from ${fromDir}`,
      );
    }
    current = parent;
  }
}

export function loadWindowsConfig(rootDir?: string): WindowsConfig {
  const root = rootDir ?? findMonorepoRoot(process.cwd());
  const configPath = join(root, 'configs', 'windows.json');
  if (!existsSync(configPath)) {
    throw new Error(
      `[nebula-vite] Missing configs/windows.json at ${configPath}`,
    );
  }
  return JSON.parse(readFileSync(configPath, 'utf-8')) as WindowsConfig;
}

export function buildAppManifest(
  config: WindowsConfig,
  rootDir: string,
): NebulaAppManifest {
  const subApps = new Set<string>();
  const preloadIds = new Set<string>();

  for (const win of Object.values(config.windows)) {
    subApps.add(win.renderer);
    preloadIds.add(win.preload);
    assertRendererPackage(rootDir, win.renderer);
  }

  if (config.modalRenderers) {
    for (const modal of Object.values(config.modalRenderers)) {
      subApps.add(modal.renderer);
      preloadIds.add(modal.preload);
      assertRendererPackage(rootDir, modal.renderer);
    }
  }

  const embedSurfaces = [...subApps].filter(
    (id) => id in DEFAULT_EMBED_BOOT_ENTRIES,
  );

  const embedBootEntries: Record<string, string> = {};
  for (const surface of embedSurfaces) {
    const entry = DEFAULT_EMBED_BOOT_ENTRIES[surface];
    if (!entry) {
      throw new Error(
        `[nebula-vite] embed surface "${surface}" has no boot entry mapping`,
      );
    }
    embedBootEntries[surface] = entry;
  }

  return {
    subApps: [...subApps].toSorted(),
    windowIds: Object.keys(config.windows).toSorted(),
    preloadIds: [...preloadIds].toSorted(),
    embedSurfaces: embedSurfaces.toSorted(),
    embedBootEntries,
  };
}

function assertRendererPackage(rootDir: string, renderer: string): void {
  const mainTs = join(rootDir, 'apps', 'sub-web', renderer, 'src', 'main.ts');
  const bootTs = join(rootDir, 'apps', 'sub-web', renderer, 'src', 'boot.ts');
  if (!existsSync(mainTs)) {
    throw new Error(
      `[nebula-vite] renderer "${renderer}" missing apps/sub-web/${renderer}/src/main.ts`,
    );
  }
  if (!existsSync(bootTs)) {
    throw new Error(
      `[nebula-vite] renderer "${renderer}" missing apps/sub-web/${renderer}/src/boot.ts`,
    );
  }
}

export function resolveConfigModuleDir(configModuleUrl: string | URL): string {
  return dirname(fileURLToPath(configModuleUrl));
}
