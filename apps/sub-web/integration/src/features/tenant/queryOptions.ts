import { tenantApi } from '@/features/tenant/api';
import { tenantUsersApi } from '@/features/tenant/usersApi';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function tenantsQueryOptions(admin: boolean) {
  return queryOptions({
    queryKey: integrationQueryKeys.tenants(admin ? 'admin' : 'mine'),
    queryFn: async () => {
      if (admin) {
        const page = await unwrapApiData(tenantApi.list(1, 50));
        return page.items ?? [];
      }
      return (await unwrapApiData(tenantApi.mine())) ?? [];
    },
  });
}

export function tenantDetailQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.tenantDetail(tenantId),
    enabled: Boolean(tenantId),
    queryFn: () => unwrapApiData(tenantApi.get(tenantId as string)),
  });
}

export function tenantUsersQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: integrationQueryKeys.tenantUsers(),
    enabled,
    queryFn: async () => {
      const page = await unwrapApiData(tenantUsersApi.listForBinding());
      return page.records ?? [];
    },
  });
}
