import { createQueryKey } from '@nebula-studio/query';

export const INTEGRATION_QUERY_APP = 'integration';

export function integrationQueryKey(
  ...parts: Array<number | string>
): Array<number | string> {
  return createQueryKey(INTEGRATION_QUERY_APP, ...parts);
}

export const integrationQueryKeys = {
  catalog: (tenantId?: string) =>
    integrationQueryKey('catalog', tenantId ?? 'none'),
  accessRequests: (userId?: string) =>
    integrationQueryKey('access-requests', userId ?? 'anon'),
  accessRequestsRoot: () => integrationQueryKey('access-requests'),
  subscriptions: (tenantId?: string) =>
    integrationQueryKey('subscriptions', tenantId ?? 'none'),
  datasources: () => integrationQueryKey('datasources'),
  databaseConnectors: () => integrationQueryKey('connectors', 'database'),
  pluginCatalog: () => integrationQueryKey('plugin-catalog'),
  pluginList: () => integrationQueryKey('plugins'),
  clusterNodes: () => integrationQueryKey('cluster', 'nodes'),
  executorRoutes: () => integrationQueryKey('executor', 'routes'),
  tenants: (scope: string) => integrationQueryKey('tenants', scope),
  tenantDetail: (tenantId?: string) =>
    integrationQueryKey('tenant', tenantId ?? 'none'),
  tenantUsers: () => integrationQueryKey('tenant-users'),
  interfaces: (scope: string) => integrationQueryKey('interfaces', scope),
  tasks: (tenantId?: string) =>
    integrationQueryKey('tasks', tenantId ?? 'none'),
  flows: (tenantId?: string) =>
    integrationQueryKey('flows', tenantId ?? 'none'),
  dags: (tenantId?: string) => integrationQueryKey('dags', tenantId ?? 'none'),
  connectors: () => integrationQueryKey('connectors'),
  taskInstances: (tenantId?: string) =>
    integrationQueryKey('task-instances', tenantId ?? 'none'),
  taskInstanceLogs: (instanceId?: string) =>
    integrationQueryKey('task-instance-logs', instanceId ?? 'none'),
  platformRequests: (status?: string) =>
    integrationQueryKey('platform-requests', status ?? 'all'),
  approvals: (tenantId?: string) =>
    integrationQueryKey('approvals', tenantId ?? 'none'),
  releases: (tenantId?: string) =>
    integrationQueryKey('releases', tenantId ?? 'none'),
  versions: (resourceId?: string) =>
    integrationQueryKey('versions', resourceId ?? 'none'),
  callLogs: (tenantId?: string) =>
    integrationQueryKey('call-logs', tenantId ?? 'none'),
  logStats: (tenantId?: string) =>
    integrationQueryKey('log-stats', tenantId ?? 'none'),
  topology: (tenantId?: string) =>
    integrationQueryKey('topology', tenantId ?? 'none'),
  governance: (kind: string, tenantId?: string) =>
    integrationQueryKey('governance', kind, tenantId ?? 'none'),
};
