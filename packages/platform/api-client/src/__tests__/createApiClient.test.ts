import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { createApiClient } from '../createApiClient';

describe('createApiClient unauthorized handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('invokes onUnauthorized when a protected request returns HTTP 401', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({ onUnauthorized });

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

  it('skips onUnauthorized when skipAuth is set', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({ onUnauthorized });

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

    await expect(
      client.apiRequest('/api', '/login', { skipAuth: true }),
    ).rejects.toThrow('未登录');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
