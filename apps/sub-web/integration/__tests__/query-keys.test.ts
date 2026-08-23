import { createQueryKey } from '@nebula-studio/query';

import { describe, expect, it } from 'vitest';

import { dataSourcesQueryKey } from '../src/features/datasources/queryOptions.ts';
import { pluginCatalogQueryKey } from '../src/features/plugin-catalog/queryOptions.ts';
import {
  accessRequestsByUserQueryKey,
  resourceCatalogQueryKey,
} from '../src/features/resource-catalog/queryOptions.ts';
import { subscriptionsQueryKey } from '../src/features/subscriptions/queryOptions.ts';
import { integrationQueryKeys } from '../src/shared/query/keys.ts';

describe('integration query keys', () => {
  it('uses the shared query key factory', () => {
    expect(resourceCatalogQueryKey('tenant-a')).toEqual(
      createQueryKey('integration', 'catalog', 'tenant-a'),
    );
    expect(resourceCatalogQueryKey()).toEqual(integrationQueryKeys.catalog());
    expect(subscriptionsQueryKey('tenant-a')).toEqual(
      integrationQueryKeys.subscriptions('tenant-a'),
    );
    expect(dataSourcesQueryKey()).toEqual(integrationQueryKeys.datasources());
    expect(accessRequestsByUserQueryKey('u1')).toEqual(
      integrationQueryKeys.accessRequests('u1'),
    );
    expect(pluginCatalogQueryKey()).toEqual(
      integrationQueryKeys.pluginCatalog(),
    );
    expect(integrationQueryKeys.clusterNodes()).toEqual(
      createQueryKey('integration', 'cluster', 'nodes'),
    );
    expect(integrationQueryKeys.pluginList()).toEqual(
      createQueryKey('integration', 'plugins'),
    );
    expect(integrationQueryKeys.accessRequestsRoot()).toEqual(
      createQueryKey('integration', 'access-requests'),
    );
  });
});
