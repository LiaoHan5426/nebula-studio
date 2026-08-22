import { QueryClient } from '@tanstack/vue-query';

export function createNebulaQueryClient(options: { appId: string }): {
  client: QueryClient;
  dispose(): void;
  key: (...parts: Array<number | string>) => Array<number | string>;
} {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
  return {
    client,
    key: (...parts) => [options.appId, ...parts],
    dispose() {
      client.clear();
    },
  };
}
