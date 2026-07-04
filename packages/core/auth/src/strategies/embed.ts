/**
 * EmbedStrategy — platform-embed 模式认证策略。
 *
 * 认证逻辑：
 * 1. 从父窗口 Shell 读取 session（readParentShellAuthSession）
 * 2. 若读不到，尝试通过 parentApi.auth.getSession() 远程获取
 * 3. 若仍无 session 且 allowShellLogin，请求父窗口打开登录弹窗
 * 4. 监听 `auth:session-changed` 事件同步 session 变更
 * 5. 监听 SHELL_AUTH_UNAUTHORIZED_EVENT 处理 401
 *
 * 迁移来源：
 * - integration/src/shared/composables/useAuth.ts → bootstrapAuthFromShell / ensureAuthFromShell
 * - integration/src/App.vue → requestShellLoginIfNeeded / onShellAuthUnauthorized
 */
import {
  readParentShellAuthSession,
  isSurfaceEmbed,
  SHELL_AUTH_UNAUTHORIZED_EVENT,
} from '@nebula-studio/app-shell';
import {
  setAuthSession,
  hasValidAuthToken,
  getAuthToken,
} from '@nebula-studio/auth-provider/session';
import { globalAuthProvider } from '@nebula-studio/auth-provider';
import type { AuthBootstrapOptions, AuthStrategy } from '../types';

export class EmbedStrategy implements AuthStrategy {
  private _allowShellLogin = true;
  private _disposeListeners: Array<() => void> = [];

  async bootstrap(options?: AuthBootstrapOptions): Promise<boolean> {
    this._allowShellLogin = options?.allowShellLogin ?? true;

    // 1. 从父窗口同步 session
    await this.bootstrapAuthFromShell();

    // 2. 若仍无 session，请求父 Shell 打开登录
    if (!hasValidAuthToken() && this._allowShellLogin) {
      await this.requestShellLoginIfNeeded();
    }

    // 3. 注册 session 变更监听
    this.registerSessionChangeListeners();

    return hasValidAuthToken();
  }

  dispose(): void {
    for (const dispose of this._disposeListeners) {
      try {
        dispose();
      } catch {
        /* ignore */
      }
    }
    this._disposeListeners = [];
  }

  /**
   * 从父窗口 Shell 同步 JWT，避免二次登录。
   * 迁移自 `integration/src/shared/composables/useAuth.ts` → `bootstrapAuthFromShell`
   */
  private async bootstrapAuthFromShell(): Promise<void> {
    if (!isSurfaceEmbed('integration')) return;

    // 尝试从 sessionStorage（父窗口写入）读取
    const session = readParentShellAuthSession();
    if (session?.token && session.user) {
      this.applyShellSession(session.user, session.token);
      return;
    }

    // 尝试通过 parentApi 远程获取
    try {
      const parentApi = (
        window.parent as typeof window & {
          api?: {
            auth?: {
              getSession?: () => Promise<{
                user?: string;
                token?: string;
              } | null>;
            };
          };
        }
      ).api;
      const remote = await parentApi?.auth?.getSession?.();
      if (remote?.token && remote.user) {
        this.applyShellSession(remote.user, remote.token);
      }
    } catch {
      /* ignore cross-frame access errors */
    }
  }

  /**
   * 请求父 Shell 打开登录弹窗。
   * 迁移自 `integration/src/App.vue` → `requestShellLoginIfNeeded`
   */
  private async requestShellLoginIfNeeded(): Promise<void> {
    await this.ensureAuthFromShell();
    if (hasValidAuthToken()) return;

    try {
      const parentApi = (
        window.parent as typeof window & {
          api?: { shell?: { openLogin?: () => Promise<void> } };
        }
      ).api;
      await parentApi?.shell?.openLogin?.();
    } catch {
      /* ignore cross-frame access errors */
    }
  }

  /**
   * 确保 embed 模式已同步 Shell 登录态。
   * 迁移自 `integration/src/shared/composables/useAuth.ts` → `ensureAuthFromShell`
   */
  private async ensureAuthFromShell(): Promise<void> {
    if (!isSurfaceEmbed('integration')) return;
    if (getAuthToken()) return;
    await this.bootstrapAuthFromShell();
  }

  private applyShellSession(
    user: string,
    authToken: string,
    userRoles: string[] = [],
  ): void {
    setAuthSession(user, authToken, userRoles);
    globalAuthProvider.setSession({ user, token: authToken, roles: userRoles });
  }

  /**
   * 注册 session 变更和 401 事件监听。
   * 迁移自 `integration/src/App.vue` onMounted 中的事件监听。
   */
  private registerSessionChangeListeners(): void {
    // 401 未授权事件
    const onUnauthorized = (): void => {
      // 由调用方（App.vue）处理路由跳转
      window.dispatchEvent(new CustomEvent('nebula:auth:unauthorized'));
    };
    window.addEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    this._disposeListeners.push(() => {
      window.removeEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    });

    // Electron IPC session 变更（embed 模式下通过 iframe 继承）
    const electronWindow = window as unknown as Window & {
      electron?: {
        ipcRenderer: {
          on: (ch: string, fn: () => void) => void;
          removeListener?: (ch: string, fn: () => void) => void;
        };
      };
    };
    if (
      isSurfaceEmbed('integration') &&
      window.parent !== window &&
      electronWindow.electron?.ipcRenderer
    ) {
      const handler = (): void => {
        void this.bootstrapAuthFromShell();
      };
      electronWindow.electron.ipcRenderer.on('auth:session-changed', handler);
      this._disposeListeners.push(() => {
        electronWindow.electron?.ipcRenderer?.removeListener?.(
          'auth:session-changed',
          handler,
        );
      });
    }
  }
}
