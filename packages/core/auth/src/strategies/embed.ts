/**
 * EmbedStrategy — platform-embed 模式认证策略。
 *
 * 认证逻辑：
 * 1. 从父窗口 Shell 读取 session（readParentShellAuthSession）
 * 2. 若读不到，尝试通过 parentApi.auth.getSession() 远程获取
 * 3. 若仍无 session 且 allowShellLogin，请求父窗口打开登录弹窗
 * 4. 监听 `auth:session-changed` 事件同步 session 变更
 * 5. 监听 SHELL_AUTH_UNAUTHORIZED_EVENT 处理 401
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
  private _surfaceId: string | null = null;
  private _disposeListeners: Array<() => void> = [];

  async bootstrap(options?: AuthBootstrapOptions): Promise<boolean> {
    this._allowShellLogin = options?.allowShellLogin ?? true;
    this._surfaceId = options?.surfaceId ?? options?.appId ?? null;

    await this.bootstrapAuthFromShell();

    if (!hasValidAuthToken() && this._allowShellLogin) {
      await this.requestShellLoginIfNeeded();
    }

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

  private isCurrentSurfaceEmbed(): boolean {
    return this._surfaceId !== null && isSurfaceEmbed(this._surfaceId);
  }

  private async bootstrapAuthFromShell(): Promise<void> {
    if (!this.isCurrentSurfaceEmbed()) return;

    const session = readParentShellAuthSession();
    if (session?.token && session.user) {
      this.applyShellSession(session.user, session.token, session.roles ?? []);
      return;
    }

    try {
      const parentApi = (
        window.parent as typeof window & {
          api?: {
            auth?: {
              getSession?: () => Promise<{
                user?: string;
                token?: string;
                roles?: string[];
              } | null>;
            };
          };
        }
      ).api;
      const remote = await parentApi?.auth?.getSession?.();
      if (remote?.token && remote.user) {
        this.applyShellSession(remote.user, remote.token, remote.roles ?? []);
      }
    } catch {
      /* ignore cross-frame access errors */
    }
  }

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

  private async ensureAuthFromShell(): Promise<void> {
    if (!this.isCurrentSurfaceEmbed()) return;
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

  private registerSessionChangeListeners(): void {
    const onUnauthorized = (): void => {
      window.dispatchEvent(new CustomEvent('nebula:auth:unauthorized'));
    };
    window.addEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    this._disposeListeners.push(() => {
      window.removeEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    });

    const electronWindow = window as unknown as Window & {
      electron?: {
        ipcRenderer: {
          on: (ch: string, fn: () => void) => void;
          removeListener?: (ch: string, fn: () => void) => void;
        };
      };
    };
    if (
      this.isCurrentSurfaceEmbed() &&
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
