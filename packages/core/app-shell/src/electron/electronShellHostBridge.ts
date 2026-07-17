import {
  persistActiveViewPreference,
  persistShellSurfacePreference,
} from '../common/activeViewPreference';
import { isElectronIframeEmbedPresentation } from '../common/shellPresentationConfig';
import type { ShellHostBridge } from '../common/shellHostBridge';

// `window.electron` 由 preload 脚本通过 contextBridge 注入，
// 各子应用的 env.d.ts 已声明完整类型（ElectronAPI），此处仅做最小断言。
const electronWindow = window as unknown as Window & {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    };
  };
  api: { auth: { logout(): Promise<void> } };
};

/** 已废弃：集成层显隐改由 `nebula-shell-active-view` 驱动，启动时删除以免误判 */
const LEGACY_SHELL_INTEGRATION_OPEN_KEY = 'nebula-shell-integration-open';
const LEGACY_SHELL_INTEGRATION_HOME_KEY = 'nebula-shell-integration-home';

export function createElectronShellHostBridge(): ShellHostBridge {
  return {
    kind: 'electron',
    usesIframeEmbed: isElectronIframeEmbedPresentation(),
    shouldPersistActiveViewPreference: false,
    shouldRestoreActiveViewFromPreference: false,
    persistIntegrationOpenFromWatch() {
      /* 与 Web 一致：不持久化集成层开关 */
    },
    shouldSubscribeAuthSessionChannel: true,
    shouldRefreshAuthSessionAfterLogout: true,
    async logout() {
      await electronWindow.api.auth.logout();
    },

    commitIntegrationOpen(
      open: boolean,
      options?: { clearActiveViewOnOpen?: boolean },
    ) {
      if (!open) {
        return;
      }
      /* 「回到集成首页」：清本地键 + 主进程选中子应用，刷新后与 Web 一致优先展开集成层 */
      if (options?.clearActiveViewOnOpen) {
        persistShellSurfacePreference({ kind: 'integration' });
        void electronWindow.electron.ipcRenderer.invoke(
          'shell:clear-active-embedded-view',
        );
      }
    },

    resolveInitialIntegrationOpen(activeViewId: string | null): boolean {
      /* 不以 localStorage 为准：冷启动主进程无选中子应用 ⇒ 进入应用集成 */
      const id = typeof activeViewId === 'string' ? activeViewId.trim() : '';
      return !id;
    },

    finalizeActiveViewOnMount() {
      /* Electron：不在会话间记忆子应用，不落盘 */
    },

    onIntegrationOpenChanged(open: boolean) {
      void electronWindow.electron.ipcRenderer.invoke(
        'shell:set-embedded-content-visible',
        { visible: !open },
      );
    },

    onShellUnmount() {
      void electronWindow.electron.ipcRenderer.invoke(
        'shell:set-embedded-content-visible',
        { visible: true },
      );
    },

    onBeforeShellHydrate() {
      try {
        window.localStorage.removeItem(LEGACY_SHELL_INTEGRATION_OPEN_KEY);
        window.localStorage.removeItem(LEGACY_SHELL_INTEGRATION_HOME_KEY);
        persistActiveViewPreference(null);
      } catch {
        /* ignore */
      }
    },
  };
}
