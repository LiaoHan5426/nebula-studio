import { beforeEach, describe, expect, it, vi } from 'vitest';

import { camelSubscribeApi } from '@/shared/api/subscribeApi';

const { camelSubscribeRequest } = vi.hoisted(() => ({
  camelSubscribeRequest: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  camelSubscribeRequest,
  CAMEL_SUBSCRIBE_BASE: '/api/subscribe/camel',
}));

describe('camelSubscribeApi', () => {
  beforeEach(() => {
    camelSubscribeRequest.mockReset();
    camelSubscribeRequest.mockResolvedValue({
      code: 0,
      isSuccess: true,
      data: [],
    });
  });

  it('lists subscriptions', async () => {
    await camelSubscribeApi.list();
    expect(camelSubscribeRequest).toHaveBeenCalledWith('');
  });

  it('gets a subscription by id', async () => {
    await camelSubscribeApi.get('sub-1');
    expect(camelSubscribeRequest).toHaveBeenCalledWith('/sub-1');
  });

  it('creates a subscription', async () => {
    const body = {
      dataSourceId: 'ds-1',
      subscribeType: 'POLLING',
      pollingIntervalMs: 5000,
      tableName: 'demo_orders',
    };
    await camelSubscribeApi.create(body);
    expect(camelSubscribeRequest).toHaveBeenCalledWith('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  });

  it('updates a subscription', async () => {
    const body = {
      pollingIntervalMs: 10000,
      tableName: 'demo_orders',
      dataSourceId: 'ds-1',
    };
    await camelSubscribeApi.update('sub-1', body);
    expect(camelSubscribeRequest).toHaveBeenCalledWith('/sub-1', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  });

  it('deletes a subscription', async () => {
    await camelSubscribeApi.delete('sub-1');
    expect(camelSubscribeRequest).toHaveBeenCalledWith('/sub-1', {
      method: 'DELETE',
    });
  });

  it('pauses a subscription', async () => {
    await camelSubscribeApi.pause('sub-1');
    expect(camelSubscribeRequest).toHaveBeenCalledWith('/sub-1/pause', {
      method: 'PATCH',
    });
  });

  it('resumes a subscription', async () => {
    await camelSubscribeApi.resume('sub-1');
    expect(camelSubscribeRequest).toHaveBeenCalledWith('/sub-1/resume', {
      method: 'PATCH',
    });
  });

  it('lists subscription requests with pagination', async () => {
    await camelSubscribeApi.listRequests({
      page: 1,
      pageSize: 10,
      status: 'PENDING',
    });
    expect(camelSubscribeRequest).toHaveBeenCalledWith(
      '/request?page=1&pageSize=10&status=PENDING',
    );
  });

  it('approves a subscription request', async () => {
    await camelSubscribeApi.approveRequest('req-1', 'admin');
    expect(camelSubscribeRequest).toHaveBeenCalledWith(
      '/request/req-1/approve',
      { method: 'PATCH', body: JSON.stringify({ approvedBy: 'admin' }) },
    );
  });

  it('rejects a subscription request', async () => {
    await camelSubscribeApi.rejectRequest('req-1', 'not needed', 'admin');
    expect(camelSubscribeRequest).toHaveBeenCalledWith(
      '/request/req-1/reject',
      {
        method: 'PATCH',
        body: JSON.stringify({ approvedBy: 'admin', reason: 'not needed' }),
      },
    );
  });
});
