import type { NotifySource } from '@nebula-studio-electron/electron-bridge';

export type PreloadCapability = 'auth' | 'notify' | 'settings' | 'shell';

export interface WindowPreloadConfig {
  /** 窗口标识，同时作为 Notify 的 `source` */
  id: NotifySource;
  /** 该窗口需要注入的能力列表 */
  capabilities: PreloadCapability[];
}

/**
 * 当前窗口标识，由 `setWindowId()` 在模块初始化阶段设置。
 *
 * 使用 `let` 而非 `const` 是因为 ES module 的 import 提升机制：
 * 虚拟入口文件中 `setWindowId('main')` 虽然在源码中写在 `import './unified'` 之前，
 * 但 ES module 的 import 会被提升并先于模块体执行，
 * 因此必须通过函数调用（而非 import 时的 const 声明）来设置窗口标识。
 */
let windowId: string = 'main';

/**
 * 设置当前窗口标识。
 *
 * 由虚拟入口文件（`\0nebula-preload-entry:<windowId>`）在模块初始化时调用，
 * 须确保在 `getWindowPreloadConfig()` 被调用之前执行。
 */
export function setWindowId(id: string): void {
  windowId = id;
}

/**
 * 窗口 → 能力映射表。
 *
 * 新增子应用时只需在此添加一行，无需创建新的 Preload 包。
 */
const PRELOAD_CONFIG: Record<string, WindowPreloadConfig> = {
  main: { id: 'main', capabilities: ['auth', 'notify', 'shell'] },
  docs: { id: 'docs', capabilities: ['notify'] },
  settings: { id: 'settings', capabilities: ['settings'] },
};

/**
 * 获取当前窗口的 Preload 配置。
 *
 * 根据 `setWindowId()` 设置的窗口标识查找对应配置；
 * 未匹配时回退到 `main` 配置，确保开发阶段不会因配置缺失而崩溃。
 */
export function getWindowPreloadConfig(): WindowPreloadConfig {
  return PRELOAD_CONFIG[windowId] ?? PRELOAD_CONFIG['main'];
}
