export const CONTRACT_VERSION = 1 as const;

/** First-wave Host capabilities. Theme/locale/storage factories stay on track B. */
export interface HostAuthSession {
  roles?: string[];
  tenantId?: string;
  token?: string;
  userId?: string;
  username?: string;
}

export type HostCapabilityEvent = 'auth-logout' | 'tenant-changed';

export interface HostAuthCapability {
  getSession(): HostAuthSession | Promise<HostAuthSession | null> | null;
  getToken?(): string | null;
  logout?(): Promise<void> | void;
}

export interface HostTenantCapability {
  getTenantId(): string | null;
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
    getTenantId(): string | null;
    getToken(): string | null;
  };
}

export const HOST_CAPABILITIES_KEY = 'nebulaHostCapabilities';

export interface HostThemeCapability {
  readonly scheme: 'dark' | 'light' | 'system';
  /** Optional; Settings Remote uses this instead of electron-bridge. */
  setScheme?(scheme: 'dark' | 'light' | 'system'): Promise<void> | void;
}

export interface HostLocaleCapability {
  readonly locale: string;
}

export interface HostCapabilities {
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly auth?: HostAuthCapability;
  readonly api?: HostApiCapability;
  readonly navigation?: HostNavigationCapability;
  readonly tenant?: HostTenantCapability;
  readonly events?: HostEventsCapability;
  readonly theme?: HostThemeCapability;
  readonly locale?: HostLocaleCapability;
}

export interface RemoteMountOptions {
  container: HTMLElement;
  initialPath: string;
  application: { id: string; version: string; runtimeConfig?: unknown };
  capabilities: HostCapabilities;
}

export interface RemoteHandle {
  navigate(path: string): Promise<void> | void;
  unmount(): Promise<void> | void;
}

export interface NebulaRemoteApplication {
  contractVersion: typeof CONTRACT_VERSION;
  mount(options: RemoteMountOptions): Promise<RemoteHandle>;
}
