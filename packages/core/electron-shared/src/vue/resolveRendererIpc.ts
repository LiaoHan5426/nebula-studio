export interface RendererIpcRenderer {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  on(
    channel: string,
    listener: (event: unknown, ...args: unknown[]) => void,
  ): void;
  removeListener(
    channel: string,
    listener: (event: unknown, ...args: unknown[]) => void,
  ): void;
  send?(channel: string, ...args: unknown[]): void;
}

export interface RendererProcessVersions {
  chrome?: string;
  electron?: string;
  node?: string;
  platform?: string;
}

type HostGlobals = {
  api?: {
    ipc?: RendererIpcRenderer;
    process?: { platform?: string; versions?: RendererProcessVersions };
  };
  electron?: {
    ipcRenderer?: RendererIpcRenderer;
    process?: { platform?: string; versions?: RendererProcessVersions };
  };
};

/**
 * Real Electron preload (`window.electron`) or Web `window.api.ipc`.
 * Web must not install a fake `window.electron`.
 */
export function resolveRendererIpc(): RendererIpcRenderer {
  const g = globalThis as HostGlobals;
  const ipc = g.electron?.ipcRenderer ?? g.api?.ipc;
  if (!ipc) {
    throw new Error(
      'Renderer IPC is unavailable. Electron preload or Web installWebPresentation must expose it.',
    );
  }
  return ipc;
}

export function resolveRendererProcess(): {
  platform?: string;
  versions: RendererProcessVersions;
} {
  const g = globalThis as HostGlobals;
  const process = g.electron?.process ?? g.api?.process;
  return {
    platform: process?.platform,
    versions: { ...process?.versions },
  };
}
