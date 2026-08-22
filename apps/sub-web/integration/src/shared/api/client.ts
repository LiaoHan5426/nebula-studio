import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import { createStudioApiClient } from '@nebula-studio/api-client';
import { handleShellAuthUnauthorized } from '@nebula-studio/auth-provider/web';
import { GENERATED_API_NAMESPACES } from '@nebula-studio/contracts/generated';

import { clearAuthSession } from '@/shared/auth/session';
import { hostAuthToken, hostTenantId } from '@/shared/hostCapabilityBridge';

export type { ApiRequestOptions, ApiResponse };

/** Platform Integration process; path prefixes are generated from the API context black box. */
export const CONSOLE_BASE = GENERATED_API_NAMESPACES.console.console;
/** Legacy integration CRUD paths still served by console. */
export const INTEGRATION_BASE = GENERATED_API_NAMESPACES.console.integration;
export const FLOWS_BASE = GENERATED_API_NAMESPACES.console.flows;
export const AUTH_BASE = GENERATED_API_NAMESPACES.console.auth;
export const MONITOR_BASE = GENERATED_API_NAMESPACES.console.monitor;
export const SYSTEM_BASE = GENERATED_API_NAMESPACES.platform.system;
export const GOVERNANCE_BASE = GENERATED_API_NAMESPACES.platform.governance;
export const TASK_BASE = GENERATED_API_NAMESPACES.platform.task;
export const TASK_INSTANCE_BASE =
  GENERATED_API_NAMESPACES.platform.taskInstance;
export const CLUSTER_BASE = GENERATED_API_NAMESPACES.console.cluster;
export const SUBSCRIBE_BASE = GENERATED_API_NAMESPACES.console.subscribe;
export const CAMEL_SUBSCRIBE_BASE =
  GENERATED_API_NAMESPACES.console.camelSubscribe;
export const CAMEL_TOPOLOGY_BASE =
  GENERATED_API_NAMESPACES.console.camelTopology;
export const VERSION_BASE = GENERATED_API_NAMESPACES.platform.version;
export const RELEASE_BASE = GENERATED_API_NAMESPACES.platform.release;
export const EXECUTOR_BASE = GENERATED_API_NAMESPACES.executor.executor;

/** Platform Integration Executor process; proxied in dev via the API context black box. */
export const EXECUTOR_INTEGRATION_BASE =
  GENERATED_API_NAMESPACES.console.integration;

const apiClient = createStudioApiClient({
  authProvider: { getToken: hostAuthToken },
  tenantProvider: {
    getTenantId: hostTenantId,
  },
  onUnauthorized: () => {
    clearAuthSession();
    return handleShellAuthUnauthorized();
  },
});

export const { apiRequest, fetchUrl, parseApiResponse } = apiClient;

export function consoleRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CONSOLE_BASE, endpoint, options);
}

export function integrationRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(INTEGRATION_BASE, endpoint, options);
}

export function monitorRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(MONITOR_BASE, endpoint, options);
}

export function systemRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SYSTEM_BASE, endpoint, options);
}

export function governanceRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(GOVERNANCE_BASE, endpoint, options);
}

export function executorFetch(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  return fetchUrl(`${EXECUTOR_INTEGRATION_BASE}${endpoint}`, options);
}

export function taskRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(TASK_BASE, endpoint, options);
}

export function taskInstanceRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(TASK_INSTANCE_BASE, endpoint, options);
}

export function clusterRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CLUSTER_BASE, endpoint, options);
}

export function subscribeRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SUBSCRIBE_BASE, endpoint, options);
}

export function camelSubscribeRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CAMEL_SUBSCRIBE_BASE, endpoint, options);
}

export function topologyRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CAMEL_TOPOLOGY_BASE, endpoint, options);
}
