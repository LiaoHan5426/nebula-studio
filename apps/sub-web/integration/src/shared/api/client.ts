import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import { createStudioApiClient } from '@nebula-studio/api-client';
import { handleShellAuthUnauthorized } from '@nebula-studio/app-shell';
import { GENERATED_API_BASES } from '@nebula-studio/contracts/generated';

import { clearAuthSession, getAuthToken } from '@/shared/auth/session';

export type { ApiRequestOptions, ApiResponse };

/** Platform Integration process; browser base paths are generated from configs/windows.json. */
export const CONSOLE_BASE = GENERATED_API_BASES.console;
/** Legacy integration CRUD paths still served by console. */
export const INTEGRATION_BASE = GENERATED_API_BASES.integration;
export const FLOWS_BASE = GENERATED_API_BASES.flows;
export const AUTH_BASE = GENERATED_API_BASES.auth;
export const MONITOR_BASE = GENERATED_API_BASES.monitor;
export const SYSTEM_BASE = GENERATED_API_BASES.system;
export const GOVERNANCE_BASE = GENERATED_API_BASES.governance;
export const TASK_BASE = GENERATED_API_BASES.task;
export const TASK_INSTANCE_BASE = GENERATED_API_BASES.taskInstance;
export const CLUSTER_BASE = GENERATED_API_BASES.cluster;
export const SUBSCRIBE_BASE = GENERATED_API_BASES.subscribe;
export const CAMEL_SUBSCRIBE_BASE = GENERATED_API_BASES.camelSubscribe;
export const CAMEL_TOPOLOGY_BASE = GENERATED_API_BASES.camelTopology;

/** Platform Integration Executor process; proxied in dev via configs/windows.json apiProxy. */
export const EXECUTOR_INTEGRATION_BASE = GENERATED_API_BASES.integration;

const apiClient = createStudioApiClient({
  authProvider: { getToken: getAuthToken },
  tenantProvider: {
    getTenantId: () => localStorage.getItem('tenant_id'),
  },
  onUnauthorized: () => {
    clearAuthSession();
    return handleShellAuthUnauthorized();
  },
});

export const { apiRequest, fetchUrl, parseApiResponse } = apiClient;

export function consoleRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CONSOLE_BASE, endpoint, options);
}

export function integrationRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(INTEGRATION_BASE, endpoint, options);
}

export function monitorRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(MONITOR_BASE, endpoint, options);
}

export function systemRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SYSTEM_BASE, endpoint, options);
}

export function governanceRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(GOVERNANCE_BASE, endpoint, options);
}

export function executorFetch (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  return fetchUrl(`${EXECUTOR_INTEGRATION_BASE}${endpoint}`, options);
}

export function taskRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(TASK_BASE, endpoint, options);
}

export function taskInstanceRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(TASK_INSTANCE_BASE, endpoint, options);
}

export function clusterRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CLUSTER_BASE, endpoint, options);
}

export function subscribeRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SUBSCRIBE_BASE, endpoint, options);
}

export function camelSubscribeRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CAMEL_SUBSCRIBE_BASE, endpoint, options);
}

export function topologyRequest<T> (
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CAMEL_TOPOLOGY_BASE, endpoint, options);
}
