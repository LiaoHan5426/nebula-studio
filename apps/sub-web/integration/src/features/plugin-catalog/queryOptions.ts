import { integrationQueryKeys } from '@/shared/query/keys';
import { queryOptions } from '@tanstack/vue-query';

import { loadPluginCatalog } from './api';

export function pluginCatalogQueryKey() {
  return integrationQueryKeys.pluginCatalog();
}

export function pluginCatalogQueryOptions() {
  return queryOptions({
    queryKey: pluginCatalogQueryKey(),
    queryFn: () => loadPluginCatalog(),
  });
}
