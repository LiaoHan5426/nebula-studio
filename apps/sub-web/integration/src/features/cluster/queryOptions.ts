import { clusterApi } from '@/shared/api/clusterApi';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function clusterNodesQueryOptions() {
  return queryOptions({
    queryKey: integrationQueryKeys.clusterNodes(),
    queryFn: () => unwrapApiData(clusterApi.listNodes()),
  });
}
