import {
  persistShellSurfacePreference,
  readShellSurfacePreference,
} from '../common/activeViewPreference';
import type { ShellHostBridge } from '../common/shellHostBridge';

const LEGACY_SHELL_INTEGRATION_OPEN_WEB_KEY =
  'nebula-shell-integration-open-web';
/** 旧版独立键，迁移后删除以免干扰「仅 active-view」语义 */
const LEGACY_SHELL_INTEGRATION_HOME_KEY = 'nebula-shell-integration-home';

const webWindow = window as unknown as {
  api: { auth: { logout(): Promise<void> } };
};

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
    async logout() {
      await webWindow.api.auth.logout();
    },

    commitIntegrationOpen(
      open: boolean,
      options?: { clearActiveViewOnOpen?: boolean },
    ) {
      if (!open) {
        return;
      }
      // 仅「回到集成首页」时写入集成层偏好；临时展开应用集成不改 sessionStorage
      if (options?.clearActiveViewOnOpen) {
        persistShellSurfacePreference({ kind: 'integration' });
      }
    },

    resolveInitialIntegrationOpen(_activeViewId: string | null): boolean {
      const surface = readShellSurfacePreference();
      if (surface === null) return false;
      return surface.kind === 'integration';
    },

    finalizeActiveViewOnMount(ctx) {
      if (ctx.integrationOpen) {
        persistShellSurfacePreference({ kind: 'integration' });
        return;
      }
      const id =
        typeof ctx.activeViewId === 'string' && ctx.activeViewId.trim()
          ? ctx.activeViewId
          : null;
      if (id) {
        persistShellSurfacePreference({ kind: 'view', viewId: id });
        return;
      }
      persistShellSurfacePreference({ kind: 'workspace' });
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
