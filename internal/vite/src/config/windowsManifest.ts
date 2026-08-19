import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type PreloadCapability = 'auth' | 'notify' | 'settings' | 'shell';

export type NebulaApiProxyPresetName = 'integration' | 'standard';

export interface StandaloneRuntimeConfig {
  basePath?: string;
  host?: string;
  port: number;
}

export interface ApiProxyRouteConfig {
  injectExecutorServiceToken?: boolean;
  prefix: string;
  target: string;
}

export interface RealStackHealthCheckConfig {
  id: string;
  label: string;
  probePath: string;
  startupPath: string;
  target: string;
}

export interface RendererRuntimeFields {
  preload: string;
  preloadCapabilities?: PreloadCapability[];
  proxyPreset?: NebulaApiProxyPresetName;
  renderer: string;
  standalone?: StandaloneRuntimeConfig;
  webEmbedEntry?: string;
}

export interface WindowsConfig {
  apiBases?: Record<string, string>;
  apiProxy?: {
    presets: Record<NebulaApiProxyPresetName, ApiProxyRouteConfig[]>;
  };
  apiTargets?: Record<string, string>;
  displayOrder?: string[];
  e2e?: { mockRoutePatterns: string[] };
  electronEmbeddedPresentation?: 'browser-view' | 'iframe';
  modalRenderers?: Record<string, RendererRuntimeFields>;
  realStack?: {
    healthChecks: RealStackHealthCheckConfig[];
    openapi: { platform: { path: string; target: string } };
    probeHost?: string;
    unauthorizedProbe?: { path: string; target: string };
  };
  rendererSources?: Record<string, string>;
  shell?: {
    electron?: { rendererEntry?: string };
    embedQuery?: string;
    topInsetPx?: number;
    web?: { basePath?: string; host: string; port: number };
  };
  windows: Record<
    string,
    RendererRuntimeFields & {
      defaultEnabled?: boolean;
      iconSvg?: string;
      integratable?: boolean;
      label: string;
      requiresAuth?: boolean;
    }
  >;
}

export interface NebulaAppManifest {
  /** Map embed surface → relative boot entry path from apps/web/src */
  embedBootEntries: Record<string, string>;
  /** Surfaces available for ?embed= query in Web shell */
  embedSurfaces: string[];
  /** Preload ID → union of capabilities declared by all surfaces using it */
  preloadCapabilities: Record<string, PreloadCapability[]>;
  /** Unique preload IDs used by windows and modal renderers */
  preloadIds: string[];
  /** Unique renderer package directory names under apps/sub-web */
  subApps: string[];
  /** Window IDs from configs/windows.json */
  windowIds: string[];
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
  const preloadCapabilities = new Map<string, Set<PreloadCapability>>();
  const embedBootEntries: Record<string, string> = {};

  for (const win of Object.values(config.windows)) {
    subApps.add(win.renderer);
    registerPreload(
      win.preload,
      win.preloadCapabilities,
      preloadIds,
      preloadCapabilities,
    );
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
      registerPreload(
        modal.preload,
        modal.preloadCapabilities,
        preloadIds,
        preloadCapabilities,
      );
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
    preloadCapabilities: Object.fromEntries(
      [...preloadCapabilities.entries()]
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([preloadId, capabilities]) => [
          preloadId,
          [...capabilities].toSorted(),
        ]),
    ),
    embedSurfaces,
    embedBootEntries,
  };
}

function registerPreload(
  preloadId: string,
  capabilities: PreloadCapability[] | undefined,
  preloadIds: Set<string>,
  capabilityMap: Map<string, Set<PreloadCapability>>,
): void {
  preloadIds.add(preloadId);
  const registered =
    capabilityMap.get(preloadId) ?? new Set<PreloadCapability>();
  for (const capability of capabilities ?? []) {
    registered.add(capability);
  }
  capabilityMap.set(preloadId, registered);
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
