import { electronAPI } from '@electron-toolkit/preload';

type AuthLoginResult =
  | { ok: true; user: string }
  | { ok: false; error: string };

/**
 * 统一 Auth 能力模块。
 *
 * 封装 `auth:*` IPC 通道调用，供需要认证能力的窗口 Preload 使用。
 */
export function createAuthCapability() {
  return {
    async login(payload: { user: string; password: string }) {
      const r = (await electronAPI.ipcRenderer.invoke(
        'auth:login',
        payload,
      )) as AuthLoginResult;
      if (r.ok === false) throw new Error(r.error);
      return r;
    },
    getSession(): Promise<{
      user: string;
      token?: string;
      roles?: string[];
      userId?: string;
    } | null> {
      return electronAPI.ipcRenderer.invoke('auth:get-session');
    },
    establishSession(payload: {
      user: string;
      token: string;
      roles?: string[];
      userId?: string;
    }): Promise<boolean> {
      return electronAPI.ipcRenderer.invoke('auth:establish-session', payload);
    },
    logout(): Promise<boolean> {
      return electronAPI.ipcRenderer.invoke('auth:logout');
    },
  };
}
