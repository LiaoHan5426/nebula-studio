import { pluginApi } from '@/features/plugin/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function pluginListQueryOptions() {
  return queryOptions({
    queryKey: integrationQueryKeys.pluginList(),
    queryFn: async () => {
      const page = await unwrapApiData(pluginApi.list({ pageSize: 100 }));
      return page.items ?? [];
    },
  });
}
