import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dagApi } from '@/features/monitor/api';

const { consoleRequest } = vi.hoisted(() => ({
  consoleRequest: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  consoleRequest,
  CONSOLE_BASE: '/api/console',
  governanceRequest: vi.fn(),
  monitorRequest: vi.fn(),
}));

describe('dagApi', () => {
  beforeEach(() => {
    consoleRequest.mockReset();
    consoleRequest.mockResolvedValue({
      code: 0,
      isSuccess: true,
      data: { id: 'dag-1', dagName: 'DAG 1' },
    });
  });

  it('posts create payload to /dag', async () => {
    await dagApi.create({
      dagName: 'DAG 1',
      tenantId: 'tenant-a',
      dagDefinition: JSON.stringify({ nodes: {} }),
    });

    expect(consoleRequest).toHaveBeenCalledWith('/dag', {
      method: 'POST',
      body: JSON.stringify({
        dagName: 'DAG 1',
        tenantId: 'tenant-a',
        dagDefinition: JSON.stringify({ nodes: {} }),
      }),
    });
  });
});
