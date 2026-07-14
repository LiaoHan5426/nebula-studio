import { createApiClient } from './createApiClient.ts';
import type { ApiClient } from './createApiClient.ts';
import type { ApiClientConfig } from './types.ts';

export interface StudioAuthProvider {
  getToken(): string | null | undefined;
}

export interface StudioTenantProvider {
  getTenantId(): string | null | undefined;
}

export interface StudioOrganizationProvider {
  getOrgId(): string | null | undefined;
}

export interface CreateStudioApiClientOptions {
  authProvider?: StudioAuthProvider;
  tenantProvider?: StudioTenantProvider;
  organizationProvider?: StudioOrganizationProvider;
  onUnauthorized?: ApiClientConfig['onUnauthorized'];
  credentials?: RequestCredentials;
  progress?: boolean;
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
