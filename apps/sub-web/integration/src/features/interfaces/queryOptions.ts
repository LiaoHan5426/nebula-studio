import { interfaceApi } from '@/shared/api/integration';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function interfacesQueryOptions(
  scope: string,
  params: {
    interfaceType?: string;
    page?: number;
    pageSize?: number;
    scope?: 'authorizable';
    status?: string;
  } = {},
) {
  return queryOptions({
    queryKey: integrationQueryKeys.interfaces(scope),
    queryFn: async () => {
      const page = await unwrapApiData(
        interfaceApi.list({
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 100,
          interfaceType: params.interfaceType,
          scope: params.scope,
          status: params.status,
        }),
      );
      return {
        items: page.items ?? [],
        total: page.total ?? page.items?.length ?? 0,
      };
    },
  });
}
