import { beforeEach, describe, expect, it, vi } from 'vitest';

import { camelTopologyApi } from '@/shared/api/topologyApi';

const { topologyRequest } = vi.hoisted(() => ({
  topologyRequest: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  topologyRequest,
  CAMEL_TOPOLOGY_BASE: '/api/camel/topology',
}));

describe('camelTopologyApi', () => {
  beforeEach(() => {
    topologyRequest.mockReset();
    topologyRequest.mockResolvedValue({
      code: 0,
      isSuccess: true,
      data: null,
    });
  });

  it('gets topology data for a route', async () => {
    await camelTopologyApi.getTopology('route-1');
    expect(topologyRequest).toHaveBeenCalledWith('/route-1');
  });

  it('gets traces for a route', async () => {
    await camelTopologyApi.getTraces('route-1');
    expect(topologyRequest).toHaveBeenCalledWith('/route-1/traces');
  });

  it('gets errors for a route', async () => {
    await camelTopologyApi.getErrors('route-1');
    expect(topologyRequest).toHaveBeenCalledWith('/route-1/errors');
  });

  it('clears traces for a route', async () => {
    await camelTopologyApi.clearTraces('route-1');
    expect(topologyRequest).toHaveBeenCalledWith('/route-1/traces', {
      method: 'DELETE',
    });
  });
});
