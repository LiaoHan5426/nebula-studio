export type ShellHostKind = 'electron' | 'web';

/**
 * 宿主壳在 Web 与 Electron 上行为差异的协议。
 * 实现由 Host / standalone composition root 注入，不要在此包内探测宿主。
 */
export interface ShellHostBridge {
  commitIntegrationOpen(
    open: boolean,
    options?: { clearActiveViewOnOpen?: boolean },
  ): void;
  finalizeActiveViewOnMount(ctx: {
    activeViewId: null | string;
    integrationOpen: boolean;
  }): void;

  readonly kind: ShellHostKind;

  logout(): Promise<void>;

  onBeforeShellHydrate(): void;

  onIntegrationOpenChanged(open: boolean): void;

  onShellUnmount(): void;

  persistIntegrationOpenFromWatch(open: boolean): void;

  resolveInitialIntegrationOpen(activeViewId: null | string): boolean;

  readonly shouldPersistActiveViewPreference: boolean;

  readonly shouldRefreshAuthSessionAfterLogout: boolean;

  readonly shouldRestoreActiveViewFromPreference: boolean;

  readonly shouldSubscribeAuthSessionChannel: boolean;

  readonly usesIframeEmbed: boolean;
}

let installed: ShellHostBridge | undefined;

export function setShellHostBridge(bridge: ShellHostBridge): void {
  installed = bridge;
}

export function getShellHostBridge(): ShellHostBridge {
  if (!installed) {
    throw new Error(
      'ShellHostBridge is not installed. Host or standalone boot must call installShellHostBridge before mounting shell-ui.',
    );
  }
  return installed;
}

/** @internal */
export function __resetShellHostBridgeForTests(): void {
  installed = undefined;
}
