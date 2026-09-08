import type { ShellIntegratedAppMeta } from './shellIntegration';

import {
  registerShellIntegratedApps,
  resetShellIntegratedAppRegistry,
  setShellIntegrableOrder,
} from './shellIntegration';
import { getEmbeddedShellWindowIds } from './shellPresentationConfig';

type ShellChromeCatalogEntry = Omit<ShellIntegratedAppMeta, 'id'>;

/**
 * Offline snapshot of backend `nebula_frontend_application` chrome rows
 * (V014). Runtime overlay from `/api/system/frontend-apps/runtime` is the
 * product source of truth. Do not put these fields back into `windows.json`.
 *
 * Shared by Web host and Electron main so `shell:get-state` defaults match.
 */
export const SHELL_CHROME_CATALOG: Record<string, ShellChromeCatalogEntry> = {
  docs: {
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
  },
  settings: {
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
  },
  integration: {
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
  },
  'low-code-studio': {
    label: '低代码工作室',
    description: '设计、预览并发布受治理的低代码应用。',
    category: 'product',
    helpKey: 'low-code.studio',
    searchKeywords: ['低代码', '设计器', '页面', '发布', '大屏'],
    roles: ['authenticated'],
    returnTo: '/',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8v8H8z"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/></svg>',
    defaultEnabled: true,
    integratable: true,
    requiresAuth: true,
  },
  'demo-board': {
    label: '运营大屏',
    description: '查看由低代码工作室发布的实时运营视图。',
    category: 'product',
    helpKey: 'low-code.runtime',
    searchKeywords: ['大屏', '运营', '指标', '低代码'],
    roles: ['authenticated'],
    returnTo: '/',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15v-4M12 15V8M16 15V6"/></svg>',
    defaultEnabled: true,
    integratable: true,
    requiresAuth: true,
  },
};

/** Fallback integrable grid order when runtime is unavailable. */
export const SHELL_INTEGRABLE_DISPLAY_ORDER: readonly string[] = [
  'integration',
  'low-code-studio',
  'demo-board',
];

const HOST_OWNED_CHROME_EXTRA_IDS = ['low-code-studio', 'demo-board'] as const;

/** Build chrome + host-owned integrable metas (no runtime overlay). */
export function buildShellChromeIntegratedAppMetas(): ShellIntegratedAppMeta[] {
  const embeddedIds = getEmbeddedShellWindowIds();
  const metas: ShellIntegratedAppMeta[] = [];
  for (const id of embeddedIds) {
    const entry = SHELL_CHROME_CATALOG[id];
    if (entry) metas.push({ id, ...entry });
  }
  for (const id of HOST_OWNED_CHROME_EXTRA_IDS) {
    if (metas.some((meta) => meta.id === id)) continue;
    const entry = SHELL_CHROME_CATALOG[id];
    if (entry) metas.push({ id, ...entry });
  }
  return metas;
}

/**
 * Register offline chrome catalog into the in-process shell integration registry.
 * Call from Electron main (before `shell:get-state`) and Web host fallback.
 */
export function bootstrapShellChromeIntegratedApps(): void {
  resetShellIntegratedAppRegistry();
  registerShellIntegratedApps(buildShellChromeIntegratedAppMetas());
  setShellIntegrableOrder([...SHELL_INTEGRABLE_DISPLAY_ORDER]);
}
