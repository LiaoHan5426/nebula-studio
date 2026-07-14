import { afterEach, describe, expect, it, vi } from 'vitest';

import { createStudioApiClient } from '../createStudioApiClient';

describe('createStudioApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards auth, tenant, and org headers from providers', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = createStudioApiClient({
      authProvider: { getToken: () => 'token-abc' },
      tenantProvider: { getTenantId: () => 'tenant-1' },
      organizationProvider: { getOrgId: () => 'org-9' },
    });

    await client.apiRequest('/api', '/resource');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
    expect(headers['X-Tenant-Id']).toBe('tenant-1');
    expect(headers['X-Org-Id']).toBe('org-9');
  });

  it('forwards onUnauthorized to the underlying client', async () => {
    const onUnauthorized = vi.fn();
    const client = createStudioApiClient({ onUnauthorized });

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: '未登录' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );

    await expect(client.apiRequest('/api', '/me')).rejects.toThrow('未登录');
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
