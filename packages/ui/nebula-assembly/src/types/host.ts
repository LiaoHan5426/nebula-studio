export type NebulaHostSurface = 'electron' | 'platform-embed' | 'standalone';

/** Raw capabilities assembled at app boot — adapters only normalize these values. */
export interface NebulaHostCapabilitiesInput {
  navigate?: (path: string) => void;
  notify?: (message: string) => void;
  openExternal?: (url: string) => Promise<void> | void;
  resolveAsset?: (path: string) => string;
  surface: NebulaHostSurface;
}

/** Normalized host contract consumed by features and editors. */
export interface HostAdapter {
  navigate(path: string): void;
  notify(message: string): void;
  openExternal(url: string): Promise<void>;
  resolveAsset(path: string): string;
  surface: NebulaHostSurface;
}

export type CreateHostAdapter = (
  capabilities: NebulaHostCapabilitiesInput,
) => HostAdapter;
