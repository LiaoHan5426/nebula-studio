/**
 * ElectronStrategy — Electron 桌面模式认证策略。
 *
 * 认证逻辑：
 * 1. 通过 IPC `auth:get-session` 检查当前 session
 * 2. 若已有 session，写入 auth-provider
 * 3. 监听 `auth:session-changed` 事件同步 session 变更
 * 4. 登录由 login 子应用 App.vue 处理（通过 `auth:establish-session`）
 *
 * 迁移来源：
 * - apps/electron/.../IpcAuthModule.ts — IPC 通信协议
 * - integration/src/App.vue — auth:session-changed 监听
 */
import {
  setAuthSession,
  hasValidAuthToken,
} from '@nebula-studio/auth-provider/session';
import { globalAuthProvider } from '@nebula-studio/auth-provider';
import { SHELL_AUTH_UNAUTHORIZED_EVENT } from '@nebula-studio/app-shell';
import type { AuthBootstrapOptions, AuthStrategy } from '../types';

interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    on: (channel: string, callback: (...args: unknown[]) => void) => void;
    removeListener?: (
      channel: string,
      callback?: (...args: unknown[]) => void,
    ) => void;
  };
}

export class ElectronStrategy implements AuthStrategy {
  private _disposeListeners: Array<() => void> = [];

  async bootstrap(_options?: AuthBootstrapOptions): Promise<boolean> {
    const electron = this.getElectronAPI();
    if (!electron) {
      // Electron 模式但 preload 未注入 → 降级为 standalone
      return hasValidAuthToken();
    }

    // 1. 从 Electron 主进程获取当前 session
    try {
      const session = (await electron.ipcRenderer.invoke(
        'auth:get-session',
      )) as {
        user?: string;
        token?: string;
        roles?: string[];
        userId?: string;
      } | null;

      if (session?.user && session.token) {
        setAuthSession(
          session.user,
          session.token,
          session.roles,
          session.userId,
        );
        globalAuthProvider.setSession({
          user: session.user,
          token: session.token,
          roles: session.roles,
          userId: session.userId,
        });
      }
    } catch {
      /* IPC 调用失败，继续让 router guard 处理 */
    }

    // 2. 监听 session 变更
    const sessionHandler = (...args: unknown[]): void => {
      const payload = args[1] as {
        user?: string;
        token?: string;
        roles?: string[];
        userId?: string;
      } | null;
      if (payload?.user && payload.token) {
        setAuthSession(
          payload.user,
          payload.token,
          payload.roles,
          payload.userId,
        );
        globalAuthProvider.setSession({
          user: payload.user,
          token: payload.token,
          roles: payload.roles,
          userId: payload.userId,
        });
      } else {
        globalAuthProvider.clearSession();
      }
    };
    electron.ipcRenderer.on('auth:session-changed', sessionHandler);
    this._disposeListeners.push(() => {
      electron.ipcRenderer.removeListener?.(
        'auth:session-changed',
        sessionHandler,
      );
    });

    // 3. 监听 401 事件
    const onUnauthorized = (): void => {
      window.dispatchEvent(new CustomEvent('nebula:auth:unauthorized'));
    };
    window.addEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    this._disposeListeners.push(() => {
      window.removeEventListener(SHELL_AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    });

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

  private getElectronAPI(): ElectronAPI | null {
    const g = globalThis as unknown as { electron?: ElectronAPI };
    return g.electron ?? null;
  }
}
