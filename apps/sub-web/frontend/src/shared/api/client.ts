import { createApiClient } from '@nebula-studio/api-client';

import type { ApiRequestOptions, ApiResponse } from '@nebula-studio/api-client';

import {
  handleShellAuthUnauthorized,
  readWebAuthSession,
} from '@nebula-studio/app-shell';
import { globalAuthProvider } from '@nebula-studio/auth-provider';

import { ensureAuthMode, isSessionAuthMode } from '@/shared/auth/authMode';

export type { ApiRequestOptions, ApiResponse };

export const AUTH_BASE = '/api/auth';

export const SYSTEM_BASE = '/api/system';

let currentOrgId = '';

export function setCurrentOrgId(orgId: string): void {
  currentOrgId = orgId;
}

function getAuthToken(): string | null {
  return globalAuthProvider.getSession()?.token ?? null;
}

const apiClient = createApiClient({
  getAuthToken,

  getOrgId: () => currentOrgId || null,

  getCredentials: () => {
    const session = readWebAuthSession();

    if (session?.user && !session.token) {
      return 'include';
    }

    return 'include';
  },

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
