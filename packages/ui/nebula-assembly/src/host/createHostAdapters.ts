import type { HostAdapter, NebulaHostCapabilitiesInput } from '../types/host';

function noopAsync(): Promise<void> {
  return Promise.resolve();
}

function normalizeCapability<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
}

export function createHostAdapter(
  capabilities: NebulaHostCapabilitiesInput,
): HostAdapter {
  return {
    surface: capabilities.surface,
    openExternal: async (url: string) => {
      const handler = capabilities.openExternal;
      if (handler) {
        await handler(url);
        return;
      }
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    notify: (message: string) => {
      normalizeCapability(capabilities.notify, () => undefined)(message);
    },
    navigate: (path: string) => {
      normalizeCapability(capabilities.navigate, () => {
        if (typeof window !== 'undefined') {
          window.location.assign(path);
        }
      })(path);
    },
    resolveAsset: (path: string) =>
      normalizeCapability(
        capabilities.resolveAsset,
        (assetPath) => assetPath,
      )(path),
  };
}

export function createWebHostAdapter(
  capabilities: NebulaHostCapabilitiesInput,
): HostAdapter {
  return createHostAdapter({
    ...capabilities,
    surface: capabilities.surface ?? 'platform-embed',
  });
}

export function createElectronHostAdapter(
  capabilities: NebulaHostCapabilitiesInput,
): HostAdapter {
  return createHostAdapter({
    ...capabilities,
    surface: 'electron',
  });
}

export function createStandaloneHostAdapter(
  capabilities: NebulaHostCapabilitiesInput,
): HostAdapter {
  return createHostAdapter({
    ...capabilities,
    surface: 'standalone',
  });
}

export async function runHostOpenExternal(
  adapter: HostAdapter,
  url: string,
): Promise<void> {
  await adapter.openExternal(url);
  await noopAsync();
}
