import { executorRoutesApi } from '@/shared/api/executorApi';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function executorRoutesQueryOptions() {
  return queryOptions({
    queryKey: integrationQueryKeys.executorRoutes(),
    queryFn: async () => (await unwrapApiData(executorRoutesApi.list())) ?? [],
  });
}

export function executorRouteDetailQueryOptions(routeId: string) {
  return queryOptions({
    queryKey: [...integrationQueryKeys.executorRoutes(), routeId],
    enabled: Boolean(routeId),
    queryFn: () => unwrapApiData(executorRoutesApi.get(routeId)),
  });
}
