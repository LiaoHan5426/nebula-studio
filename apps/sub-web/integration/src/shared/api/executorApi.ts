import { executorFetch } from '@/shared/api/client';

export function buildGatewayUrl(tenantId: string, subPath: string): string {
  const normalized = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `/api/integration/gateway/${tenantId}${normalized}`;
}

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

export async function triggerDemoChange(
  subscriptionId: string,
): Promise<{ status: number; body: string }> {
  const response = await executorFetch('/demo/trigger-change', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId }),
  });
  return { status: response.status, body: await response.text() };
}
