import { governanceApi } from '@/features/governance/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function governanceRateLimitQueryOptions(
  tenantId?: string,
  enabled = true,
) {
  return queryOptions({
    queryKey: integrationQueryKeys.governance('rate-limit', tenantId),
    enabled: Boolean(tenantId) && enabled,
    queryFn: async () => {
      const page = await unwrapApiData(
        governanceApi.rateLimitList(1, 50, tenantId),
      );
      return page.items ?? [];
    },
  });
}

export function governanceCircuitQueryOptions(
  tenantId?: string,
  enabled = true,
) {
  return queryOptions({
    queryKey: integrationQueryKeys.governance('circuit', tenantId),
    enabled: Boolean(tenantId) && enabled,
    queryFn: async () => {
      const page = await unwrapApiData(
        governanceApi.circuitBreakerList(1, 50, tenantId),
      );
      return page.items ?? [];
    },
  });
}

export function governanceWhitelistQueryOptions(
  tenantId?: string,
  enabled = true,
) {
  return queryOptions({
    queryKey: integrationQueryKeys.governance('whitelist', tenantId),
    enabled: Boolean(tenantId) && enabled,
    queryFn: async () => {
      const page = await unwrapApiData(
        governanceApi.whitelistList(1, 50, tenantId),
      );
      return page.items ?? [];
    },
  });
}
