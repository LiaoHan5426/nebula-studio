import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

/** Sub-renderer preload: keep surface smaller than main if you split IPC later. */
const api = { scope: 'pdm' as const };

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error — non-isolated fallback
  window.electron = electronAPI;
  // @ts-expect-error — non-isolated fallback
  window.api = api;
}
