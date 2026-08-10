import type { ApiClient } from './createApiClient.ts';
import type { ApiClientConfig } from './types.ts';

import { createApiClient } from './createApiClient.ts';

export interface StudioAuthProvider {
  getToken(): null | string | undefined;
}

export interface StudioTenantProvider {
  getTenantId(): null | string | undefined;
}

export interface StudioOrganizationProvider {
  getOrgId(): null | string | undefined;
}

export interface CreateStudioApiClientOptions {
  authProvider?: StudioAuthProvider;
  credentials?: RequestCredentials;
  onUnauthorized?: ApiClientConfig['onUnauthorized'];
  organizationProvider?: StudioOrganizationProvider;
  progress?: boolean;
  tenantProvider?: StudioTenantProvider;
}

/**
 * Application-level API client factory with auth/tenant/org context wiring.
 */
export function createStudioApiClient(
  options: CreateStudioApiClientOptions = {},
): ApiClient {
  return createApiClient({
    getAuthToken: () => options.authProvider?.getToken(),
    getTenantId: () => options.tenantProvider?.getTenantId(),
    getOrgId: () => options.organizationProvider?.getOrgId(),
    onUnauthorized: options.onUnauthorized,
    credentials: options.credentials,
    progress: options.progress,
  });
}
