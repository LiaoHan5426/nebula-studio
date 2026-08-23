import type { AccessRequestDraft, ResourceSummaryViewModel } from './types';

import { subscriptionRequestApi } from '@/features/subscription/api';
import { getAuthUserId } from '@/shared/auth/session';
import { integrationQueryKeys } from '@/shared/query/keys';
import { isApiSuccess } from '@/shared/types';
import { mutationOptions, queryOptions } from '@tanstack/vue-query';

import { loadResourceCatalog, submitAccessRequest } from './api';

export function resourceCatalogQueryKey(tenantId?: string) {
  return integrationQueryKeys.catalog(tenantId);
}

export function resourceCatalogQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: resourceCatalogQueryKey(tenantId),
    queryFn: () => loadResourceCatalog(tenantId),
  });
}

export function accessRequestsByUserQueryKey(userId?: string) {
  return integrationQueryKeys.accessRequests(userId);
}

export function accessRequestsByUserQueryOptions(userId?: string) {
  return queryOptions({
    queryKey: accessRequestsByUserQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const response = await subscriptionRequestApi.listByUser(userId);
      if (!isApiSuccess(response)) {
        throw new Error(response.message || 'errors.generic');
      }
      return response.data;
    },
  });
}

export function pendingAccessRequestCountQueryOptions(userId?: string) {
  return queryOptions({
    ...accessRequestsByUserQueryOptions(userId),
    select: (rows) =>
      rows.filter((request) =>
        ['NEEDS_INFO', 'PENDING', 'PENDING_REVIEW'].includes(request.status),
      ).length,
  });
}

export function cancelAccessRequestMutationOptions() {
  return mutationOptions({
    mutationFn: (requestId: string) => subscriptionRequestApi.cancel(requestId),
  });
}

export function submitAccessRequestMutationOptions() {
  return mutationOptions({
    mutationFn: (input: {
      draft: AccessRequestDraft;
      resource: ResourceSummaryViewModel;
      tenantId: string;
      userId: string;
    }) =>
      submitAccessRequest(
        input.tenantId,
        input.userId,
        input.resource,
        input.draft,
      ),
  });
}

export function currentCatalogUserId(): string | undefined {
  return getAuthUserId() || undefined;
}
