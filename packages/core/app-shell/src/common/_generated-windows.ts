// AUTO-GENERATED — do not edit manually.
// Source: configs/windows.json

export interface GeneratedWindowEntry {
  preload: string;
  renderer: string;
  label: string;
  iconSvg?: string;
  defaultEnabled?: boolean;
  integratable?: boolean;
  requiresAuth?: boolean;
  preloadCapabilities?: string[];
}

export interface GeneratedModalRendererEntry {
  preload: string;
  renderer: string;
  preloadCapabilities?: string[];
}

export const GENERATED_SHELL_CONFIG = {
  topInsetPx: 56,
} as const;

export const GENERATED_ELECTRON_EMBEDDED_PRESENTATION = 'iframe' as const;

export const GENERATED_WINDOWS: Record<string, GeneratedWindowEntry> = {
  main: {
    preload: 'main',
    renderer: 'frontend',
    label: '工作台',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    integratable: false,
    requiresAuth: false,
    preloadCapabilities: ['auth', 'notify', 'shell'],
  },
  docs: {
    preload: 'docs',
    renderer: 'docs',
    label: '文档',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    defaultEnabled: true,
    integratable: false,
    requiresAuth: false,
    preloadCapabilities: ['notify'],
  },
  settings: {
    preload: 'settings',
    renderer: 'settings',
    label: '设置',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    defaultEnabled: true,
    integratable: false,
    requiresAuth: true,
    preloadCapabilities: ['settings'],
  },
  integration: {
    preload: 'main',
    renderer: 'integration',
    label: '集成平台',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    defaultEnabled: true,
    integratable: true,
    requiresAuth: true,
    preloadCapabilities: ['auth', 'notify'],
  },
} as const;

export const GENERATED_MODAL_RENDERERS: Record<
  string,
  GeneratedModalRendererEntry
> = {
  login: {
    preload: 'main',
    renderer: 'login',
    preloadCapabilities: ['auth'],
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
} as const;

export const GENERATED_API_TARGETS: Record<string, string> = {
  platform: 'http://localhost:8090',
  console: 'http://localhost:8080',
  executor: 'http://localhost:8081',
} as const;

export type GeneratedWindowId = 'main' | 'docs' | 'settings' | 'integration';
