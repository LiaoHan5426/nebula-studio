import { taskApi } from '@/shared/api/taskApi';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { queryOptions } from '@tanstack/vue-query';

export function tasksQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.tasks(tenantId),
    queryFn: () => unwrapApiData(taskApi.list(tenantId)),
  });
}

export function taskInstancesQueryOptions(tenantId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.taskInstances(tenantId),
    queryFn: () => unwrapApiData(taskApi.listInstances(undefined, tenantId)),
  });
}

export function taskInstanceLogsQueryOptions(instanceId?: string) {
  return queryOptions({
    queryKey: integrationQueryKeys.taskInstanceLogs(instanceId),
    enabled: Boolean(instanceId),
    queryFn: () => unwrapApiData(taskApi.getInstanceLogs(instanceId as string)),
  });
}
