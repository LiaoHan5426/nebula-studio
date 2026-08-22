import type { ResolvedTheme, ThemePreference } from '@nebula-studio/tokens';

export const CONTRACT_VERSION = 1 as const;

/** Host capabilities. Theme preference is additive (track B); contractVersion stays 1. */
export interface HostAuthSession {
  roles?: string[];
  tenantId?: string;
  token?: string;
  userId?: string;
  username?: string;
}

export type HostCapabilityEvent = 'auth-logout' | 'tenant-changed';

export interface HostAuthCapability {
  getSession(): HostAuthSession | null | Promise<HostAuthSession | null>;
  getToken?(): null | string;
  logout?(): Promise<void> | void;
}

export interface HostTenantCapability {
  getTenantId(): null | string;
}

export interface HostEventsCapability {
  subscribe(
    event: HostCapabilityEvent,
    handler: (payload?: string) => void,
  ): () => void;
}

export interface HostNavigationCapability {
  openApplication?(applicationId: string): Promise<void> | void;
  openExternal?(url: string): Promise<void> | void;
}

/** Token/tenant adapter for Remote api-client; not a full HTTP client. */
export interface HostApiCapability {
  createClient(): {
    getTenantId(): null | string;
    getToken(): null | string;
  };
}

export const HOST_CAPABILITIES_KEY = 'nebulaHostCapabilities';

export interface HostThemeCapability {
  readonly preference?: ThemePreference;
  readonly resolved?: ResolvedTheme;
  readonly scheme: 'dark' | 'light' | 'system';
  setPreference?(
    next: Partial<ThemePreference> | ThemePreference,
  ): Promise<void> | void;
  /** Optional; Settings Remote uses this instead of electron-bridge. */
  setScheme?(scheme: 'dark' | 'light' | 'system'): Promise<void> | void;
  subscribe?(listener: (resolved: ResolvedTheme) => void): () => void;
}

export interface HostLocaleCapability {
  readonly locale: string;
}

export interface HostCapabilities {
  readonly api?: HostApiCapability;
  readonly auth?: HostAuthCapability;
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly events?: HostEventsCapability;
  readonly locale?: HostLocaleCapability;
  readonly navigation?: HostNavigationCapability;
  readonly tenant?: HostTenantCapability;
  readonly theme?: HostThemeCapability;
}

export interface RemoteMountOptions {
  application: { id: string; runtimeConfig?: unknown; version: string };
  capabilities: HostCapabilities;
  container: HTMLElement;
  initialPath: string;
}

export interface RemoteHandle {
  navigate(path: string): Promise<void> | void;
  unmount(): Promise<void> | void;
}

export interface NebulaRemoteApplication {
  contractVersion: typeof CONTRACT_VERSION;
  mount(options: RemoteMountOptions): Promise<RemoteHandle>;
}
