import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import { createStudioApiClient } from '@nebula-studio/api-client';
import { handleShellAuthUnauthorized } from '@nebula-studio/auth-provider/web';
import { GENERATED_API_NAMESPACES } from '@nebula-studio/contracts/generated';

import {
  clearAuthSession,
  getAuthToken,
  getCurrentOrgId,
} from '@/shared/auth/session';

export type { ApiRequestOptions, ApiResponse };

export const SYSTEM_BASE = GENERATED_API_NAMESPACES.platform.system;
export const AUTH_BASE = GENERATED_API_NAMESPACES.console.auth;
export const CONFIG_BASE = GENERATED_API_NAMESPACES.platform.config;

const apiClient = createStudioApiClient({
  authProvider: { getToken: getAuthToken },
  organizationProvider: { getOrgId: () => getCurrentOrgId() || null },
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

export function configRequest<T>(
  endpoint: string,

  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(CONFIG_BASE, endpoint, options);
}
