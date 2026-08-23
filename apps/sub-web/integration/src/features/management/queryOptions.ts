import { subscriptionRequestApi } from '@/features/subscription/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function platformRequestsQueryOptions(status?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.platformRequests(status),
    queryFn: async () => {
      const page = await unwrapApiData(
        subscriptionRequestApi.list({
          page: 1,
          pageSize: 100,
          ...(status ? { status } : {}),
        }),
      );
      return page.items ?? [];
    },
  });
}
