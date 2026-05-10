import {
  persistActiveViewPreference,
  readActiveViewPreference,
} from '../common/activeViewPreference';
import type { ShellHostBridge } from '../common/shellHostBridge';

const LEGACY_SHELL_INTEGRATION_OPEN_WEB_KEY = 'nebula-shell-integration-open-web';
/** 旧版独立键，迁移后删除以免干扰「仅 active-view」语义 */
const LEGACY_SHELL_INTEGRATION_HOME_KEY = 'nebula-shell-integration-home';

export function createWebShellHostBridge(): ShellHostBridge {
  return {
    kind: 'web',
    usesIframeEmbed: true,
    shouldPersistActiveViewPreference: true,
    shouldRestoreActiveViewFromPreference: true,
    persistIntegrationOpenFromWatch() {
      /* Web 不持久化集成层开闭 */
    },
    shouldSubscribeAuthSessionChannel: false,
    shouldRefreshAuthSessionAfterLogout: false,

    commitIntegrationOpen(open: boolean, options?: { clearActiveViewOnOpen?: boolean }) {
      if (!open) {
        return;
      }
      // 仅「回到集成首页」时移除 active-view；临时展开应用集成不改 localStorage
      if (options?.clearActiveViewOnOpen) {
        persistActiveViewPreference(null);
      }
    },

    resolveInitialIntegrationOpen(_activeViewId: string | null): boolean {
      // 仅以 nebula-shell-active-view 为准；忽略 shell 内存里可能存在的默认 docs
      return !readActiveViewPreference();
    },

    finalizeActiveViewOnMount(ctx) {
      if (ctx.integrationOpen) {
        persistActiveViewPreference(null);
        return;
      }
      const id =
        typeof ctx.activeViewId === 'string' && ctx.activeViewId.trim()
          ? ctx.activeViewId
          : null;
      persistActiveViewPreference(id);
    },

    onIntegrationOpenChanged() {
      /* Web：无 BrowserView 可见性 IPC */
    },

    onShellUnmount() {
      /* Web：无恢复嵌入可见性 */
    },

    onBeforeShellHydrate() {
      try {
        window.localStorage.removeItem(LEGACY_SHELL_INTEGRATION_OPEN_WEB_KEY);
        window.localStorage.removeItem(LEGACY_SHELL_INTEGRATION_HOME_KEY);
      } catch {
        /* ignore */
      }
    },
  };
}
