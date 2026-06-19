import { createApiClient } from '@nebula-studio/api-client';
import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';
import { getAuthToken } from '@/shared/auth/session';

export type { ApiRequestOptions };

/** Console process (demo-camel-console :8080) */
export const CONSOLE_BASE = '/api/console';
/** Legacy integration CRUD paths still served by console */
export const INTEGRATION_BASE = '/api/integration';
export const FLOWS_BASE = '/api/flows';
export const AUTH_BASE = '/api/auth';
export const MONITOR_BASE = '/api/monitor';
export const GOVERNANCE_BASE = '/api/security/governance';

/** Executor process (demo-camel-executor :8081) — proxied in dev */
export const EXECUTOR_INTEGRATION_BASE = '/api/integration';

const apiClient = createApiClient({
  getAuthToken,
  getTenantId: () => localStorage.getItem('tenant_id'),
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
