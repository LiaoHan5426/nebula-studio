import { createApiClient } from '@nebula-studio/api-client';

import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import { handleShellAuthUnauthorized } from '@nebula-studio/app-shell';

import {
  clearAuthSession,
  getAuthToken,
  getCurrentOrgId,
} from '@/shared/auth/session';

export type { ApiRequestOptions, ApiResponse };

export const SYSTEM_BASE = '/api/system';

export const AUTH_BASE = '/api/auth';

const apiClient = createApiClient({
  getAuthToken,

  getOrgId: () => getCurrentOrgId() || null,

  credentials: 'include',

  onUnauthorized: () => {
    clearAuthSession();
    return handleShellAuthUnauthorized();
  },
});

export const { apiRequest, fetchUrl, parseApiResponse } = apiClient;

export function systemRequest<T>(
  endpoint: string,

  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SYSTEM_BASE, endpoint, options);
}

export function authRequest<T>(
  endpoint: string,

  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(AUTH_BASE, endpoint, options);
}
