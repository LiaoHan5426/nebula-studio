import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import {
  createAuthCapability,
  createNotifyCapability,
  createSettingsCapability,
  createShellCapability,
} from './capabilities/index.ts';
import { getWindowPreloadConfig } from './config.ts';
import type { PreloadCapability } from './config.ts';

/**
 * 统一 Electron Preload 入口。
 *
 * 本模块 **不含顶层副作用**：所有初始化逻辑封装在 `bootstrap()` 中，
 * 由虚拟入口文件在 `setWindowId()` 之后显式调用，确保窗口标识已就绪。
 *
 * 虚拟入口文件（由 `createUnifiedPreloadVirtualEntries` 生成）：
 * ```js
 * import { setWindowId, bootstrap } from '<srcDir>/unified.ts';
 * setWindowId('<windowId>');
 * bootstrap();
 * ```
 *
 * ES module 加载顺序：
 * 1. `unified.ts` 被加载（仅定义函数，无顶层副作用）
 * 2. `capabilities/*.ts` 被加载（仅定义工厂函数）
 * 3. 入口模块体执行：`setWindowId('xxx')` → `bootstrap()`
 *
 * 新增子应用时只需：
 * 1. 在 `config.ts` 的 `PRELOAD_CONFIG` 中添加窗口配置
 * 2. 在 `electron.vite.config.ts` 的 `windowIds` 中添加窗口 ID
 */

export { setWindowId } from './config.ts';

/**
 * 初始化 Preload：根据窗口标识组装能力模块并暴露到渲染进程。
 *
 * 须在 `setWindowId()` 之后调用。
 */
export function bootstrap(): void {
  const config = getWindowPreloadConfig();
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
