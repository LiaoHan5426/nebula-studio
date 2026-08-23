import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import { createStudioApiClient } from '@nebula-studio/api-client';
import { globalAuthProvider } from '@nebula-studio/auth-provider';
import { handleShellAuthUnauthorized } from '@nebula-studio/auth-provider/web';
import { GENERATED_API_NAMESPACES } from '@nebula-studio/contracts/generated';

import { ensureAuthMode, isSessionAuthMode } from '@/shared/auth/authMode';

export type { ApiRequestOptions, ApiResponse };

export const AUTH_BASE = GENERATED_API_NAMESPACES.console.auth;
export const SYSTEM_BASE = GENERATED_API_NAMESPACES.platform.system;
export const CONSOLE_BASE = GENERATED_API_NAMESPACES.console.console;
export const MONITOR_BASE = GENERATED_API_NAMESPACES.console.monitor;

let currentOrgId = '';

export function setCurrentOrgId(orgId: string): void {
  currentOrgId = orgId;
}

const apiClient = createStudioApiClient({
  authProvider: {
    getToken: () => globalAuthProvider.getSession()?.token ?? null,
  },
  organizationProvider: { getOrgId: () => currentOrgId || null },
  credentials: 'include',
  onUnauthorized: () => handleShellAuthUnauthorized(),
});

export const { apiRequest } = apiClient;

export async function initApiClientAuthMode(): Promise<void> {
  const mode = await ensureAuthMode();

  if (isSessionAuthMode(mode)) {
    // Session mode relies on cookies; credentials already set to include.
  }
}

export function authRequest<T>(
  endpoint: string,

  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(AUTH_BASE, endpoint, options);
}

export function systemRequest<T>(
  endpoint: string,

  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(SYSTEM_BASE, endpoint, options);
}
