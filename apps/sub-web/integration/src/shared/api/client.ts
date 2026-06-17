import type { ApiResponse } from '@/shared/types';
import { getAuthToken } from '@/shared/auth/session';

export type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipTenant?: boolean;
};

function buildHeaders(options: ApiRequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!options.skipAuth) {
    const authToken = getAuthToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }

  if (!options.skipTenant) {
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }
  }

  const extra = options.headers;
  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      headers[key] = value;
    }
  } else if (extra) {
    Object.assign(headers, extra);
  }

  return headers;
}

export async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    skipAuth: _skipAuth,
    skipTenant: _skipTenant,
    ...fetchOptions
  } = options;
  void _skipAuth;
  void _skipTenant;

  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

export const INTEGRATION_BASE = '/api/integration';
export const FLOWS_BASE = '/api/flows';
export const AUTH_BASE = '/api/auth';
