import { contextBridge } from 'electron';

import {
  createAuthCapability,
  createNotifyCapability,
  createSettingsCapability,
  createShellCapability,
} from './capabilities/index.ts';
import { electronAPI } from './electronApi.ts';

export type PreloadCapability = 'auth' | 'notify' | 'settings' | 'shell';

export interface WindowPreloadConfig {
  /** Preload 标识，同时作为 Notify 的 `source` */
  id: string;
  /** 从 configs/windows.json 派生的能力列表 */
  capabilities: PreloadCapability[];
}

/**
 * 统一 Electron Preload 入口。
 *
 * 本模块 **不含顶层副作用**：所有初始化逻辑封装在 `bootstrap()` 中，
 * 能力配置由构建期虚拟入口根据 `configs/windows.json` 注入。
 *
 * 虚拟入口文件（由 `createUnifiedPreloadVirtualEntries` 生成）：
 * ```js
 * import { bootstrap } from '<srcDir>/unified.ts';
 * bootstrap({ id: '<preloadId>', capabilities: ['auth'] });
 * ```
 *
 * 新增窗口或能力时只需更新 `configs/windows.json`；manifest 会按复用同一
 * preload ID 的所有窗口合并 capability。
 */

/**
 * 初始化 Preload：根据构建期注入的配置组装能力模块并暴露到渲染进程。
 */
export function bootstrap(config: WindowPreloadConfig): void {
  const capabilities = new Set<PreloadCapability>(config.capabilities);

  // 构建 API 对象（按能力动态组装）
  const api: Record<string, unknown> = {
    // `scope` 保持与旧版 Preload 向后兼容（docs/settings 渲染器通过此字段判断运行环境）
    scope: config.id,
  };

  if (capabilities.has('auth')) {
    api.auth = createAuthCapability();
  }

  if (capabilities.has('notify')) {
    api.notify = createNotifyCapability(config.id);
  }

  if (capabilities.has('settings')) {
    api.settings = createSettingsCapability();
  }

  if (capabilities.has('shell')) {
    api.shell = createShellCapability();
  }

  // 暴露 API 到渲染进程
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('electron', electronAPI);
      contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
      console.error(`[preload:${config.id}] Failed to expose APIs:`, error);
    }
  } else {
    // non-isolated fallback
    window.electron = electronAPI;
    window.api = api;
  }
}
