import { ipcRenderer, webFrame, webUtils } from 'electron';

type IpcListener = (event: unknown, ...args: unknown[]) => void;

/**
 * Official Electron preload bridge (contextIsolation-safe).
 * Replaces `@electron-toolkit/preload`'s `electronAPI`.
 */
export const electronAPI = {
  ipcRenderer: {
    send(channel: string, ...args: unknown[]): void {
      ipcRenderer.send(channel, ...args);
    },
    sendSync(channel: string, ...args: unknown[]): unknown {
      return ipcRenderer.sendSync(channel, ...args);
    },
    sendToHost(channel: string, ...args: unknown[]): void {
      ipcRenderer.sendToHost(channel, ...args);
    },
    postMessage(
      channel: string,
      message: unknown,
      transfer?: MessagePort[],
    ): void {
      ipcRenderer.postMessage(channel, message, transfer);
    },
    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args);
    },
    on(channel: string, listener: IpcListener): () => void {
      const wrapped = (event: unknown, ...args: unknown[]) =>
        listener(event, ...args);
      ipcRenderer.on(channel, wrapped);
      return () => {
        ipcRenderer.removeListener(channel, wrapped);
      };
    },
    once(channel: string, listener: IpcListener): () => void {
      const wrapped = (event: unknown, ...args: unknown[]) =>
        listener(event, ...args);
      ipcRenderer.once(channel, wrapped);
      return () => {
        ipcRenderer.removeListener(channel, wrapped);
      };
    },
    removeListener(channel: string, listener: IpcListener): void {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: string): void {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  webFrame: {
    insertCSS(css: string): string {
      return webFrame.insertCSS(css);
    },
    setZoomFactor(factor: number): void {
      if (typeof factor === 'number' && factor > 0) {
        webFrame.setZoomFactor(factor);
      }
    },
    setZoomLevel(level: number): void {
      if (typeof level === 'number') {
        webFrame.setZoomLevel(level);
      }
    },
  },
  webUtils: {
    getPathForFile(file: File): string {
      return webUtils.getPathForFile(file);
    },
  },
  process: {
    get platform(): string {
      return process.platform;
    },
    get versions(): NodeJS.ProcessVersions {
      return process.versions;
    },
    get env(): NodeJS.ProcessEnv {
      return { ...process.env };
    },
  },
};
