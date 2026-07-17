import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
      webEmbedEntry?: string;
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
      webEmbedEntry?: string;
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

export function findMonorepoRoot(fromDir: string): string {
  let current = resolve(fromDir);
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
  const embedBootEntries: Record<string, string> = {};

  for (const win of Object.values(config.windows)) {
    subApps.add(win.renderer);
    preloadIds.add(win.preload);
    assertRendererPackage(rootDir, win.renderer);
    registerWebEmbedEntry(
      rootDir,
      win.renderer,
      win.webEmbedEntry,
      embedBootEntries,
    );
  }

  if (config.modalRenderers) {
    for (const modal of Object.values(config.modalRenderers)) {
      subApps.add(modal.renderer);
      preloadIds.add(modal.preload);
      assertRendererPackage(rootDir, modal.renderer);
      registerWebEmbedEntry(
        rootDir,
        modal.renderer,
        modal.webEmbedEntry,
        embedBootEntries,
      );
    }
  }

  const embedSurfaces = Object.keys(embedBootEntries).toSorted();

  return {
    subApps: [...subApps].toSorted(),
    windowIds: Object.keys(config.windows).toSorted(),
    preloadIds: [...preloadIds].toSorted(),
    embedSurfaces,
    embedBootEntries,
  };
}

function registerWebEmbedEntry(
  rootDir: string,
  renderer: string,
  entry: string | undefined,
  entries: Record<string, string>,
): void {
  if (!entry) return;
  if (!entry.startsWith('./embed/') || !entry.endsWith('-entry.js')) {
    throw new Error(
      `[nebula-vite] renderer "${renderer}" has invalid webEmbedEntry "${entry}"`,
    );
  }
  const existing = entries[renderer];
  if (existing && existing !== entry) {
    throw new Error(
      `[nebula-vite] renderer "${renderer}" has conflicting Web embed entries`,
    );
  }
  const sourcePath = join(
    rootDir,
    'apps',
    'web',
    'src',
    entry.slice(2).replace(/\.js$/, '.ts'),
  );
  if (!existsSync(sourcePath)) {
    throw new Error(
      `[nebula-vite] renderer "${renderer}" missing Web embed entry ${entry}`,
    );
  }
  entries[renderer] = entry;
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
