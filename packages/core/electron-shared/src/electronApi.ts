/**
 * Context-bridge–safe Electron surface exposed as `window.electron`.
 * Types only — the preload implementation lives in `apps/electron-preload`.
 */

export type IpcRendererListener = (event: unknown, ...args: unknown[]) => void;

export interface ElectronIpcRenderer {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  on(channel: string, listener: IpcRendererListener): () => void;
  once(channel: string, listener: IpcRendererListener): () => void;
  postMessage(
    channel: string,
    message: unknown,
    transfer?: MessagePort[],
  ): void;
  removeAllListeners(channel: string): void;
  /** @deprecated Prefer the disposer returned by `on`. */
  removeListener(channel: string, listener: IpcRendererListener): void;
  send(channel: string, ...args: unknown[]): void;
  sendSync(channel: string, ...args: unknown[]): unknown;
  sendToHost(channel: string, ...args: unknown[]): void;
}

export interface ElectronWebFrame {
  insertCSS(css: string): string;
  setZoomFactor(factor: number): void;
  setZoomLevel(level: number): void;
}

export interface ElectronWebUtils {
  getPathForFile(file: File): string;
}

export interface ElectronNodeProcess {
  readonly env: { [key: string]: string | undefined };
  readonly platform: string;
  readonly versions: { [key: string]: string | undefined };
}

export interface ElectronAPI {
  ipcRenderer: ElectronIpcRenderer;
  process: ElectronNodeProcess;
  webFrame: ElectronWebFrame;
  webUtils: ElectronWebUtils;
}
