import type { HostCapabilities } from '@nebula-studio/application-contract';

import { getAuthToken } from '@/shared/auth/session';

let bound: HostCapabilities | undefined;

export function bindHostCapabilities(capabilities?: HostCapabilities): void {
  bound = capabilities;
}

export function hostAuthToken(): null | string {
  const fromHost =
    bound?.auth?.getToken?.() ?? bound?.api?.createClient()?.getToken();
  if (typeof fromHost === 'string' && fromHost.trim()) {
    return fromHost;
  }
  return getAuthToken();
}

export function hostTenantId(): null | string {
  const fromHost =
    bound?.tenant?.getTenantId() ?? bound?.api?.createClient()?.getTenantId();
  if (typeof fromHost === 'string' && fromHost.trim()) {
    return fromHost;
  }
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem('tenant_id');
}

export function boundHostCapabilities(): HostCapabilities | undefined {
  return bound;
}
