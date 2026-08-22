import type { ApiResponse } from '@nebula-studio/api-client';

import { createStudioApiClient } from '@nebula-studio/api-client';
import { handleShellAuthUnauthorized } from '@nebula-studio/app-shell';
import { globalAuthProvider } from '@nebula-studio/auth-provider';

import { ensureAuthMode, isSessionAuthMode } from '@/shared/auth/authMode';

import { CONSOLE_BASE, MONITOR_BASE, SYSTEM_BASE } from './client';

export type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

const apiClient = createStudioApiClient({
  authProvider: {
    getToken: () => globalAuthProvider.getSession()?.token ?? null,
  },
  organizationProvider: {
    getOrgId: () => localStorage.getItem('nebula_current_org_id') || null,
  },
  credentials: 'include',
  onUnauthorized: () => handleShellAuthUnauthorized(),
});

export const { apiRequest } = apiClient;

export async function initApiClientAuthMode(): Promise<void> {
  const mode = await ensureAuthMode();
  if (isSessionAuthMode(mode)) {
    // Session mode relies on cookies.
  }
}

export function consoleRequest<T>(
  endpoint: string,
  options: Parameters<typeof apiRequest>[2] = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CONSOLE_BASE, endpoint, options);
}

export function systemRequest<T>(
  endpoint: string,
  options: Parameters<typeof apiRequest>[2] = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SYSTEM_BASE, endpoint, options);
}

export interface WorkspaceSummaryData {
  incidentCount: number;
  pendingRequestCount: number;
  resourceCount: number;
  taskCount: number;
}

function countPendingRequests(
  records: Array<{ status?: string }> | undefined,
): number {
  return (records ?? []).filter((item) =>
    ['NEEDS_INFO', 'PENDING', 'PENDING_REVIEW'].includes(String(item.status)),
  ).length;
}

export async function fetchWorkspaceSummary(
  userId?: string,
): Promise<WorkspaceSummaryData> {
  const [requests, tasks, resources, alerts] = await Promise.allSettled([
    userId
      ? consoleRequest<Array<{ status?: string }>>(
          `/subscription-request/user/${encodeURIComponent(userId)}`,
        )
      : Promise.resolve({ code: 200, isSuccess: true, data: [] }),
    consoleRequest<Array<unknown>>('/task'),
    consoleRequest<{ records?: unknown[]; total?: number }>(
      '/resource?page=1&size=1',
    ),
    apiRequest<Array<{ level?: string }>>(MONITOR_BASE, '/alerts/active'),
  ]);

  const pendingRequestCount =
    requests.status === 'fulfilled' && requests.value.isSuccess
      ? countPendingRequests(requests.value.data)
      : 0;

  const taskCount =
    tasks.status === 'fulfilled' && tasks.value.isSuccess
      ? (tasks.value.data?.length ?? 0)
      : 0;

  const resourceCount =
    resources.status === 'fulfilled' && resources.value.isSuccess
      ? (resources.value.data?.total ??
        resources.value.data?.records?.length ??
        0)
      : 0;

  const incidentCount =
    alerts.status === 'fulfilled' && alerts.value.isSuccess
      ? (alerts.value.data?.length ?? 0)
      : 0;

  return {
    pendingRequestCount,
    taskCount,
    resourceCount,
    incidentCount,
  };
}
