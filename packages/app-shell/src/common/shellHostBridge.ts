import { createElectronShellHostBridge } from '../electron/electronShellHostBridge';
import { createWebShellHostBridge } from '../web/webShellHostBridge';
import { getPresentationHost } from './presentationHost';

export type ShellHostKind = 'web' | 'electron';

/**
 * 宿主壳（App.vue）在 Web 与 Electron 上行为差异的**唯一聚合点**。
 * 新增与宿主相关的分支逻辑时，应扩展此接口并实现两侧，避免散落在业务组件中。
 */
export interface ShellHostBridge {
  readonly kind: ShellHostKind;
  /** Web：子应用以 iframe 内嵌；Electron：BrowserView */
  readonly usesIframeEmbed: boolean;

  /**
   * 打开/关闭应用集成层。
   * `clearActiveViewOnOpen: true`：移除 `nebula-shell-active-view`（回到集成首页），刷新后无 active-view 则展开集成层；
   * `false`：仅展开 UI，不改 localStorage，刷新仍按已存的 active-view 恢复子应用。
   */
  commitIntegrationOpen(
    open: boolean,
    options?: { clearActiveViewOnOpen?: boolean },
  ): void;

  /** 挂载阶段：是否显示应用集成层 */
  resolveInitialIntegrationOpen(activeViewId: string | null): boolean;

  /** 挂载末尾：按当前 integrationOpen / activeView 落盘 activeView 偏好 */
  finalizeActiveViewOnMount(ctx: {
    integrationOpen: boolean;
    activeViewId: string | null;
  }): void;

  /**
   * Web：可将当前子应用写入 `nebula-shell-active-view`，刷新后恢复。
   * Electron：否，关闭应用后不记忆上次子应用。
   */
  readonly shouldPersistActiveViewPreference: boolean;

  /**
   * Web：挂载时若 localStorage 与宿主状态不一致，可按偏好切换子应用。
   * Electron：否，仅以本次会话主进程 / 内存状态为准。
   */
  readonly shouldRestoreActiveViewFromPreference: boolean;

  /** integrationOpen watch：两侧均不写入独立「集成层开关」键，仅由 active-view 与 IPC 可见性表达 */
  persistIntegrationOpenFromWatch(open: boolean): void;

  /** integrationOpen 变化时通知主进程（Electron） */
  onIntegrationOpenChanged(open: boolean): void;

  readonly shouldSubscribeAuthSessionChannel: boolean;

  readonly shouldRefreshAuthSessionAfterLogout: boolean;

  onShellUnmount(): void;

  /** 宿主 hydrate 前（如清理遗留 localStorage key） */
  onBeforeShellHydrate(): void;
}

let cached: ShellHostBridge | undefined;

export function getShellHostBridge(): ShellHostBridge {
  if (!cached) {
    cached =
      getPresentationHost() === 'web'
        ? createWebShellHostBridge()
        : createElectronShellHostBridge();
  }
  return cached;
}
