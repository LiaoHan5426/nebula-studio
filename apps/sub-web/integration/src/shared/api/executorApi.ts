import { apiRequest, executorFetch } from '@/shared/api/client';
import type { ApiResponse } from '@nebula-studio/contracts/integration';

export interface ExecutorRouteView {
  routeId: string;
  endpoint: string;
  status: string;
  callCount: number;
  errorRate: number;
  avgLatencyMs: number;
  description?: string;
}

/** Executor 管理面走服务令牌（由 Vite/BFF 注入），401 不应清用户会话。 */
const executorAuthOpts = { skipAuth: true } as const;

export const executorRoutesApi = {
  list(): Promise<ApiResponse<ExecutorRouteView[]>> {
    return apiRequest<ExecutorRouteView[]>('/api/executor', '/routes', {
      ...executorAuthOpts,
    });
  },

  get(routeId: string): Promise<ApiResponse<ExecutorRouteView>> {
    return apiRequest<ExecutorRouteView>(
      '/api/executor',
      `/routes/${encodeURIComponent(routeId)}`,
      { ...executorAuthOpts },
    );
  },
};

export async function gatewayRequest(
  tenantId: string,
  subPath: string,
  options: {
    method?: string;
    body?: unknown;
    apiKey?: string;
    token?: string | null;
  } = {},
): Promise<{ status: number; body: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': tenantId,
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.apiKey) {
    headers['X-API-Key'] = options.apiKey;
  }

  const method = options.method ?? 'GET';
  const response = await executorFetch(
    `/gateway/${tenantId}${subPath.startsWith('/') ? subPath : `/${subPath}`}`,
    {
      method,
      headers,
      skipAuth: true,
      skipTenant: true,
      body:
        options.body !== undefined &&
        options.body !== null &&
        ['POST', 'PUT', 'PATCH'].includes(method)
          ? JSON.stringify(options.body)
          : undefined,
    },
  );

  return {
    status: response.status,
    body: await response.text(),
  };
}
