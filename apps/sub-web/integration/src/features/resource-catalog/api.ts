import type { CatalogSourceId } from '@/shared/i18n/errors';
import type { ApiResponse } from '@/shared/types';

import type { AccessRequestDraft, ResourceSummaryViewModel } from './types';

import { pluginCatalogApi } from '@/features/plugin/api';
import { subscriptionRequestApi } from '@/features/subscription/api';
import {
  connectorApi,
  interfaceApi,
  resourceApi,
} from '@/shared/api/integration';
import { isApiSuccess } from '@/shared/types';

import {
  dedupeResources,
  mapApiResource,
  mapConnectorResource,
  mapManagedResource,
  mapPluginResource,
} from './mappers';

export interface CatalogLoadResult {
  items: ResourceSummaryViewModel[];
  unavailableSources: CatalogSourceId[];
}

function responseData<T>(
  result: PromiseSettledResult<ApiResponse<T>>,
  source: CatalogSourceId,
  unavailableSources: CatalogSourceId[],
): T | undefined {
  if (result.status === 'fulfilled' && isApiSuccess(result.value)) {
    return result.value.data;
  }
  unavailableSources.push(source);
  return undefined;
}

export async function loadResourceCatalog(
  tenantId?: string,
): Promise<CatalogLoadResult> {
  const results = await Promise.allSettled([
    interfaceApi.list({ page: 1, pageSize: 200, status: 'ACTIVE' }),
    connectorApi.list(),
    pluginCatalogApi.list(),
    tenantId
      ? resourceApi.list({ tenantId, page: 1, size: 200 })
      : Promise.resolve(undefined),
  ]);
  const unavailableSources: CatalogSourceId[] = [];
  const interfaces = responseData(results[0], 'api', unavailableSources);
  const connectors = responseData(results[1], 'connector', unavailableSources);
  const plugins = responseData(results[2], 'pluginCatalog', unavailableSources);
  const managedResult = results[3];
  const managed =
    tenantId && managedResult?.status === 'fulfilled' && managedResult.value
      ? isApiSuccess(managedResult.value)
        ? managedResult.value.data
        : undefined
      : undefined;
  if (tenantId && !managed) unavailableSources.push('orgResources');

  return {
    items: dedupeResources([
      ...(interfaces?.items ?? []).map(mapApiResource),
      ...(connectors ?? []).map(mapConnectorResource),
      ...(plugins ?? []).map(mapPluginResource),
      ...(managed?.records ?? []).map(mapManagedResource),
    ]),
    unavailableSources,
  };
}

export async function submitAccessRequest(
  tenantId: string,
  userId: string,
  resource: ResourceSummaryViewModel,
  draft: AccessRequestDraft,
) {
  return subscriptionRequestApi.create({
    tenantId,
    userId,
    interfaceId: resource.sourceId,
    requestType: `ACCESS_${resource.kind}`,
    reason: draft.purpose,
    requestConfig: {
      resourceName: resource.name,
      resourceKind: resource.kind,
      environment: draft.environment,
      duration: draft.duration,
      scope: draft.scope,
      sensitivityConfirmed: draft.sensitivityConfirmed,
    },
  });
}
