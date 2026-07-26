import { electronAPI } from '@electron-toolkit/preload';
import type {
  ElectronAuthApi,
  ElectronAuthLoginResult,
} from '@nebula-studio/contracts/auth';

/**
 * 统一 Auth 能力模块。
 *
 * 封装 `auth:*` IPC 通道调用，供需要认证能力的窗口 Preload 使用。
 */
export function createAuthCapability(): ElectronAuthApi {
  return {
    async login(payload: { user: string; password: string }) {
      const r = (await electronAPI.ipcRenderer.invoke(
        'auth:login',
        payload,
      )) as ElectronAuthLoginResult;
      if (r.ok === false) throw new Error(r.error);
      return r;
    },
    getSession() {
      return electronAPI.ipcRenderer.invoke('auth:get-session');
    },
    establishSession(payload) {
      return electronAPI.ipcRenderer.invoke('auth:establish-session', payload);
    },
    logout() {
      return electronAPI.ipcRenderer.invoke('auth:logout');
    },
  };
}
