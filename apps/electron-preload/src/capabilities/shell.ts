import { electronAPI } from '@electron-toolkit/preload';

/**
 * 统一 Shell 能力模块。
 *
 * 封装壳层操作 IPC（如打开登录窗口），仅主窗口 Preload 需要。
 */
export function createShellCapability() {
  return {
    openLogin(): Promise<boolean> {
      return electronAPI.ipcRenderer.invoke('shell:open-login');
    },
  };
}
