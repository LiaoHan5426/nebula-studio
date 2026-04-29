import { contextBridge, ipcRenderer } from 'electron';
import { createPreloadInvoker } from '@nebula-studio/capacitor-electron';
import type {
  IpcInvoke,
  BridgeRequest,
} from '@nebula-studio/capacitor-electron';

const ipcInvoke: IpcInvoke = async (channel: string, request: BridgeRequest) =>
  ipcRenderer.invoke(channel, request);
const invoke = createPreloadInvoker(ipcInvoke);

console.info('[electron-preload] exposing __nebulaStudioCapElectron');
contextBridge.exposeInMainWorld('__nebulaStudioCapElectron', { invoke });
