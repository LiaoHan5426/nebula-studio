import { dagApi } from '@/features/monitor/api';
import { flowsApi } from '@/shared/api/flows';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function flowsQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.flows(tenantId),
    queryFn: async () => {
      const page = await unwrapApiData(
        flowsApi.list({ pageSize: 50, tenantId }),
      );
      return page.records ?? [];
    },
  });
}

export function dagsQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.dags(tenantId),
    queryFn: () => unwrapApiData(dagApi.list(tenantId)),
  });
}
