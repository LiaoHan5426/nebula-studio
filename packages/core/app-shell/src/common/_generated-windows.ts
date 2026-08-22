// AUTO-GENERATED — do not edit manually.
// Source: configs/windows.json + internal/vite API context black box

export type GeneratedPreloadCapability =
  | 'auth'
  | 'notify'
  | 'settings'
  | 'shell';

export interface GeneratedWindowEntry {
  preload: string;
  renderer: string;
  webEmbedEntry?: string;
  webLoad?: 'embed' | 'federation' | 'host';
  preloadCapabilities: GeneratedPreloadCapability[];
  proxyPreset?: 'integration' | 'standard';
  standalone?: { host?: string; port: number; basePath?: string };
}

export interface GeneratedModalRendererEntry {
  preload: string;
  renderer: string;
  webEmbedEntry?: string;
  webLoad?: 'embed' | 'federation' | 'host';
  preloadCapabilities: GeneratedPreloadCapability[];
  proxyPreset?: 'integration' | 'standard';
  standalone?: { host?: string; port: number; basePath?: string };
}

export const GENERATED_SHELL_CONFIG = {
  topInsetPx: 56,
  web: { host: 'localhost', port: 5173, basePath: '/' },
  electron: { rendererEntry: 'renderer/index.html' },
  embedQuery: 'embed',
} as const;

export const GENERATED_ELECTRON_EMBEDDED_PRESENTATION = 'iframe' as const;

export const GENERATED_WINDOWS: Record<string, GeneratedWindowEntry> = {
  main: {
    preload: 'main',
    renderer: 'frontend',
    preloadCapabilities: ['auth', 'notify', 'shell'],
    proxyPreset: 'standard',
    standalone: { port: 5175, basePath: '/' },
  },
  docs: {
    preload: 'docs',
    renderer: 'docs',
    webLoad: 'federation',
    preloadCapabilities: ['notify'],
    standalone: { port: 5176, basePath: '/' },
  },
  settings: {
    preload: 'settings',
    renderer: 'settings',
    webLoad: 'federation',
    preloadCapabilities: ['settings'],
    proxyPreset: 'standard',
    standalone: { port: 5177, basePath: '/' },
  },
  integration: {
    preload: 'main',
    renderer: 'integration',
    webLoad: 'federation',
    preloadCapabilities: ['auth', 'notify'],
    proxyPreset: 'integration',
    standalone: { port: 5174, basePath: '/' },
  },
} as const;

export const GENERATED_MODAL_RENDERERS: Record<
  string,
  GeneratedModalRendererEntry
> = {
  login: {
    preload: 'main',
    renderer: 'login',
    webLoad: 'host',
    preloadCapabilities: ['auth'],
    proxyPreset: 'standard',
    standalone: { port: 5178, basePath: '/' },
  },
} as const;

export const GENERATED_DISPLAY_ORDER: readonly string[] = [];

export const GENERATED_API_NAMESPACES = {
  platform: {
    platform: '/api/platform',
    system: '/api/system',
    governance: '/api/security/governance',
    version: '/api/version',
    release: '/api/release',
    releases: '/api/releases',
    task: '/api/task',
    taskInstance: '/api/task/instance',
    config: '/api/config',
  },
  console: {
    console: '/api/console',
    auth: '/api/auth',
    integration: '/api/integration',
    flows: '/api/flows',
    monitor: '/api/monitor',
    cluster: '/api/cluster',
    subscribe: '/api/subscribe',
    camelSubscribe: '/api/subscribe/camel',
    camelTopology: '/api/camel/topology',
  },
  executor: {
    executor: '/api/executor',
  },
} as const;

export const GENERATED_API_TARGETS: Record<string, string> = {
  platform: 'http://localhost:8090',
  console: 'http://localhost:8080',
  executor: 'http://localhost:8088',
} as const;

export const GENERATED_SHELL_WEB_BASE_URL = 'http://localhost:5173' as const;

export const GENERATED_ELECTRON_RENDERER_ENTRY = 'renderer/index.html' as const;

export const GENERATED_SHELL_EMBED_QUERY = 'embed' as const;

export const GENERATED_STANDALONE_APPS = {
  frontend: {
    host: 'localhost',
    port: 5175,
    basePath: '/',
    baseUrl: 'http://localhost:5175',
    proxyPreset: 'standard',
    embedPath: null,
  },
  docs: {
    host: 'localhost',
    port: 5176,
    basePath: '/',
    baseUrl: 'http://localhost:5176',
    proxyPreset: null,
    embedPath: '/?embed=docs',
  },
  settings: {
    host: 'localhost',
    port: 5177,
    basePath: '/',
    baseUrl: 'http://localhost:5177',
    proxyPreset: 'standard',
    embedPath: '/?embed=settings',
  },
  integration: {
    host: 'localhost',
    port: 5174,
    basePath: '/',
    baseUrl: 'http://localhost:5174',
    proxyPreset: 'integration',
    embedPath: '/?embed=integration',
  },
  login: {
    host: 'localhost',
    port: 5178,
    basePath: '/',
    baseUrl: 'http://localhost:5178',
    proxyPreset: 'standard',
    embedPath: '/?embed=login',
  },
} as const;

export const GENERATED_REAL_STACK = {
  probeHost: '127.0.0.1',
  healthChecks: [
    {
      id: 'platform',
      label: 'Platform Console',
      target: 'platform',
      startupPath: '/actuator/health',
      probePath: '/actuator/health',
    },
    {
      id: 'console',
      label: 'Platform Integration',
      target: 'console',
      startupPath: '/actuator/health',
      probePath: '/actuator/health',
    },
    {
      id: 'executor',
      label: 'Platform Integration Executor',
      target: 'executor',
      startupPath: '/actuator/health',
      probePath: '/actuator/health',
    },
  ],
  openapi: {
    platform: {
      target: 'platform',
      path: '/v3/api-docs',
    },
  },
  unauthorizedProbe: {
    target: 'platform',
    path: '/monitor/api/metrics',
  },
} as const;

export const GENERATED_E2E = {
  mockRoutePatterns: ['**/api/**'],
} as const;

export type GeneratedWindowId = 'main' | 'docs' | 'settings' | 'integration';
