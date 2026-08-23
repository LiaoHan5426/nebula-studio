import type { App } from 'vue';

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export type NebulaQueryKeyPart = number | string;

export type NebulaQueryKey = readonly NebulaQueryKeyPart[];

export interface NebulaQueryHandle {
  client: QueryClient;
  dispose(): void;
  install(app: App): void;
  key: (...parts: NebulaQueryKeyPart[]) => NebulaQueryKeyPart[];
}

export function createQueryKey(
  appId: string,
  ...parts: NebulaQueryKeyPart[]
): NebulaQueryKeyPart[] {
  return [appId, ...parts];
}

export function createNebulaQueryClient(options: {
  appId: string;
  retry?: number;
}): NebulaQueryHandle {
  const retry = options.retry ?? 1;
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry,
        staleTime: 30_000,
      },
    },
  });
  return {
    client,
    key: (...parts) => createQueryKey(options.appId, ...parts),
    install(app) {
      app.use(VueQueryPlugin, { queryClient: client });
    },
    dispose() {
      client.clear();
    },
  };
}

export function createTestQueryClient(options: {
  appId: string;
}): NebulaQueryHandle {
  return createNebulaQueryClient({
    appId: options.appId,
    retry: 0,
  });
}
