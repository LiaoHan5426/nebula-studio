import type { SubscriptionConfig } from '@/shared/types';

import { subscriptionApi } from '@/features/subscription/api';
import { integrationQueryKeys } from '@/shared/query/keys';
import { isApiSuccess } from '@/shared/types';
import { mutationOptions, queryOptions } from '@tanstack/vue-query';

import { mapSubscriptionList } from './mappers';

export function subscriptionsQueryKey(tenantId?: string) {
  return integrationQueryKeys.subscriptions(tenantId);
}

export function subscriptionsQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: subscriptionsQueryKey(tenantId),
    queryFn: async () => {
      const response = await subscriptionApi.list({
        tenantId,
        pageSize: 100,
      });
      if (!isApiSuccess(response)) {
        throw new Error(response.message || 'errors.generic');
      }
      return mapSubscriptionList(response.data);
    },
  });
}

export function createSubscriptionMutationOptions() {
  return mutationOptions({
    mutationFn: (input: { config: SubscriptionConfig; tenantId: string }) =>
      subscriptionApi.create(input.tenantId, input.config),
  });
}
