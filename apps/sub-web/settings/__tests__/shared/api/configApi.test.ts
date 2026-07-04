import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configApi } from '@/shared/api/configApi';

const { configRequest } = vi.hoisted(() => ({
  configRequest: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  configRequest,
  CONFIG_BASE: '/api/config',
}));

describe('configApi', () => {
  beforeEach(() => {
    configRequest.mockReset();
    configRequest.mockResolvedValue({
      code: 0,
      isSuccess: true,
      data: [],
    });
  });

  it('lists configs with default params', async () => {
    await configApi.list();
    expect(configRequest).toHaveBeenCalledWith('');
  });

  it('lists configs with scope filter', async () => {
    await configApi.list({ scope: 'SYSTEM' });
    expect(configRequest).toHaveBeenCalledWith('?scope=SYSTEM');
  });

  it('lists configs with group and tenantId', async () => {
    await configApi.list({ group: 'logging', tenantId: 't1' });
    expect(configRequest).toHaveBeenCalledWith('?group=logging&tenantId=t1');
  });

  it('gets a config by key', async () => {
    await configApi.get('app.name', 'GLOBAL');
    expect(configRequest).toHaveBeenCalledWith('/app.name?scope=GLOBAL');
  });

  it('gets a config by key with tenantId', async () => {
    await configApi.get('app.name', 'TENANT', 't1');
    expect(configRequest).toHaveBeenCalledWith(
      '/app.name?scope=TENANT&tenantId=t1',
    );
  });

  it('saves a config', async () => {
    const body = { key: 'app.name', value: 'Nebula', scope: 'GLOBAL' };
    await configApi.save(body);
    expect(configRequest).toHaveBeenCalledWith('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  });

  it('deletes a config', async () => {
    await configApi.delete('app.name', 'GLOBAL');
    expect(configRequest).toHaveBeenCalledWith('/app.name?scope=GLOBAL', {
      method: 'DELETE',
    });
  });

  it('deletes a config with tenantId', async () => {
    await configApi.delete('app.name', 'TENANT', 't1');
    expect(configRequest).toHaveBeenCalledWith(
      '/app.name?scope=TENANT&tenantId=t1',
      {
        method: 'DELETE',
      },
    );
  });
});
