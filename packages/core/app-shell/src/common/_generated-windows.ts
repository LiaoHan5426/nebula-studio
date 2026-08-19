// AUTO-GENERATED — do not edit manually.
// Source: configs/windows.json

export type GeneratedPreloadCapability =
  | 'auth'
  | 'notify'
  | 'settings'
  | 'shell';

export interface GeneratedWindowEntry {
  preload: string;
  renderer: string;
  webEmbedEntry?: string;
  label: string;
  description?: string;
  category?: 'workspace' | 'product' | 'support' | 'settings';
  helpKey?: string;
  searchKeywords?: string[];
  roles?: string[];
  returnTo?: string;
  iconSvg?: string;
  defaultEnabled?: boolean;
  integratable?: boolean;
  requiresAuth?: boolean;
  preloadCapabilities: GeneratedPreloadCapability[];
  proxyPreset?: 'integration' | 'standard';
  standalone?: { host?: string; port: number; basePath?: string };
}

export interface GeneratedModalRendererEntry {
  preload: string;
  renderer: string;
  webEmbedEntry?: string;
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
    label: '工作台',
    description: '查看最近访问、申请、待办、异常和常用资源。',
    category: 'workspace',
    helpKey: 'shell.workspace',
    searchKeywords: ['首页', '最近访问', '待办', '申请'],
    roles: ['authenticated'],
    returnTo: 'workspace',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    integratable: false,
    requiresAuth: false,
    preloadCapabilities: ['auth', 'notify', 'shell'],
    proxyPreset: 'standard',
    standalone: { port: 5175, basePath: '/' },
  },
  docs: {
    preload: 'docs',
    renderer: 'docs',
    webEmbedEntry: './embed/docs-entry.js',
    label: '文档',
    description: '查找产品帮助、任务指引和开发者参考。',
    category: 'support',
    helpKey: 'docs.home',
    searchKeywords: ['帮助', '指南', '组件', '文档'],
    roles: ['public'],
    returnTo: '/',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    defaultEnabled: true,
    integratable: false,
    requiresAuth: false,
    preloadCapabilities: ['notify'],
    standalone: { port: 5176, basePath: '/' },
  },
  settings: {
    preload: 'settings',
    renderer: 'settings',
    webEmbedEntry: './embed/settings-entry.js',
    label: '设置',
    description: '调整个人偏好并管理组织或平台设置。',
    category: 'settings',
    helpKey: 'settings.home',
    searchKeywords: ['外观', '用户', '角色', '权限', '配置'],
    roles: ['authenticated'],
    returnTo: '/appearance',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    defaultEnabled: true,
    integratable: false,
    requiresAuth: true,
    preloadCapabilities: ['settings'],
    proxyPreset: 'standard',
    standalone: { port: 5177, basePath: '/' },
  },
  integration: {
    preload: 'main',
    renderer: 'integration',
    webEmbedEntry: './embed/integration-entry.js',
    label: '集成平台',
    description: '查找和申请资源，或进入提供方与平台治理工作台。',
    category: 'product',
    helpKey: 'integration.home',
    searchKeywords: ['资源', 'API', '库表', 'Connector', '订阅', '插件'],
    roles: ['authenticated'],
    returnTo: '/catalog',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    defaultEnabled: true,
    integratable: true,
    requiresAuth: true,
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
    webEmbedEntry: './embed/login-entry.js',
    preloadCapabilities: ['auth'],
    proxyPreset: 'standard',
    standalone: { port: 5178, basePath: '/' },
  },
} as const;

export const GENERATED_DISPLAY_ORDER: readonly string[] = [
  'integration',
] as const;

export const GENERATED_API_BASES: Record<string, string> = {
  console: '/api/console',
  executor: '/api/executor',
  platform: '/api/platform',
  system: '/api/system',
  auth: '/api/auth',
  governance: '/api/security/governance',
  version: '/api/version',
  release: '/api/release',
  releases: '/api/releases',
  integration: '/api/integration',
  flows: '/api/flows',
  monitor: '/api/monitor',
  task: '/api/task',
  taskInstance: '/api/task/instance',
  cluster: '/api/cluster',
  subscribe: '/api/subscribe',
  camelSubscribe: '/api/subscribe/camel',
  camelTopology: '/api/camel/topology',
  config: '/api/config',
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

export const GENERATED_API_PROXY = {
  presets: {
    integration: [
      {
        prefix: '/api/integration/gateway',
        target: 'executor',
      },
      {
        prefix: '/api/integration/demo',
        target: 'executor',
      },
      {
        prefix: '/api/executor',
        target: 'executor',
        injectExecutorServiceToken: true,
      },
      {
        prefix: '/api/system',
        target: 'platform',
      },
      {
        prefix: '/api/platform',
        target: 'platform',
      },
      {
        prefix: '/api/security/governance',
        target: 'platform',
      },
      {
        prefix: '/api/version',
        target: 'platform',
      },
      {
        prefix: '/api/release',
        target: 'platform',
      },
      {
        prefix: '/api/releases',
        target: 'platform',
      },
      {
        prefix: '/api/config',
        target: 'platform',
      },
      {
        prefix: '/api/task',
        target: 'platform',
      },
      {
        prefix: '/api',
        target: 'console',
      },
    ],
    standard: [
      {
        prefix: '/api/system',
        target: 'platform',
      },
      {
        prefix: '/api/platform',
        target: 'platform',
      },
      {
        prefix: '/api/security/governance',
        target: 'platform',
      },
      {
        prefix: '/api/version',
        target: 'platform',
      },
      {
        prefix: '/api/release',
        target: 'platform',
      },
      {
        prefix: '/api/releases',
        target: 'platform',
      },
      {
        prefix: '/api/config',
        target: 'platform',
      },
      {
        prefix: '/api/task',
        target: 'platform',
      },
      {
        prefix: '/api',
        target: 'console',
      },
    ],
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
      probePath: '/api/platform/health',
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
