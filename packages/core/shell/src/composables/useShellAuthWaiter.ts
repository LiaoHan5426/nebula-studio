/**
 * Shell 认证等待 composable。
 *
 * 从 `frontend/App.vue` 提取（Plan-11 Task 10）。
 * 提供 Electron shell 场景下的认证等待机制：
 * 当嵌入视图需要认证时，阻塞直到用户完成登录或超时。
 */
import {
  clearWebAuthSession,
  embeddedViewRequiresShellAuth,
  getShellHostBridge,
  hasValidShellAuthSession,
  readWebAuthSession,
} from '@nebula-studio/app-shell';

const SHELL_AUTH_WAIT_TIMEOUT_MS = 120_000;

export interface ShellAuthWaiterOptions {
  /** 获取当前 auth session */
  getAuthSession: () => { user: string; token?: string } | null;
  /** 设置 auth session */
  setAuthSession: (session: { user: string; token?: string } | null) => void;
  /** 打开登录窗口 */
  openLogin: () => Promise<void>;
  /** 刷新 auth session */
  refreshAuthSession: () => Promise<void>;
}

export function useShellAuthWaiter(opts: ShellAuthWaiterOptions) {
  const shellHost = getShellHostBridge();
  const authLoginWaiters = new Set<(ok: boolean) => void>();

  function resolveShellAuthLoginWaiters(ok: boolean): void {
    for (const resolve of authLoginWaiters) {
      resolve(ok);
    }
    authLoginWaiters.clear();
  }

  function hasAuthenticatedShellSession(): boolean {
    return hasValidShellAuthSession(
      opts.getAuthSession() ?? readWebAuthSession(),
    );
  }

  function waitForShellAuthSession(): Promise<boolean> {
    if (hasAuthenticatedShellSession()) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      authLoginWaiters.add(resolve);
      window.setTimeout(() => {
        if (!authLoginWaiters.delete(resolve)) return;
        resolve(hasAuthenticatedShellSession());
      }, SHELL_AUTH_WAIT_TIMEOUT_MS);
    });
  }

  async function ensureShellAuthForEmbeddedView(
    viewId: string,
  ): Promise<boolean> {
    if (shellHost.kind !== 'electron') return true;
    if (!embeddedViewRequiresShellAuth(viewId)) return true;
    await opts.refreshAuthSession();
    if (hasAuthenticatedShellSession()) return true;
    await opts.openLogin();
    return waitForShellAuthSession();
  }

  function clearShellAuthSession(): void {
    clearWebAuthSession();
    opts.setAuthSession(null);
  }

  return {
    hasAuthenticatedShellSession,
    waitForShellAuthSession,
    ensureShellAuthForEmbeddedView,
    resolveShellAuthLoginWaiters,
    clearShellAuthSession,
  };
}
