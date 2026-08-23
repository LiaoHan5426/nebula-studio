import { connectorApi, dataSourceApi } from '@/shared/api/integration';
import { integrationQueryKeys } from '@/shared/query/keys';
import { isApiSuccess } from '@/shared/types';
import { queryOptions } from '@tanstack/vue-query';

export function dataSourcesQueryKey() {
  return integrationQueryKeys.datasources();
}

export function databaseConnectorsQueryKey() {
  return integrationQueryKeys.databaseConnectors();
}

export function dataSourcesQueryOptions() {
  return queryOptions({
    queryKey: dataSourcesQueryKey(),
    queryFn: async () => {
      const response = await dataSourceApi.list();
      if (!isApiSuccess(response)) {
        throw new Error(response.message || 'errors.generic');
      }
      return response.data;
    },
  });
}

export function connectorsQueryOptions() {
  return queryOptions({
    queryKey: integrationQueryKeys.connectors(),
    queryFn: async () => {
      const response = await connectorApi.list();
      if (!isApiSuccess(response)) {
        throw new Error(response.message || 'errors.generic');
      }
      const seen = new Set<string>();
      return response.data.filter((connector) => {
        if (!connector.connectorId || seen.has(connector.connectorId)) {
          return false;
        }
        seen.add(connector.connectorId);
        return true;
      });
    },
  });
}

export function databaseConnectorsQueryOptions() {
  return queryOptions({
    queryKey: databaseConnectorsQueryKey(),
    queryFn: async () => {
      const response = await connectorApi.getDatabaseConnectors();
      if (!isApiSuccess(response)) {
        throw new Error(response.message || 'errors.generic');
      }
      const seen = new Set<string>();
      return response.data.filter((connector) => {
        if (!connector.connectorId || seen.has(connector.connectorId)) {
          return false;
        }
        seen.add(connector.connectorId);
        return true;
      });
    },
  });
}
