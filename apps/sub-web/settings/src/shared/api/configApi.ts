import { configRequest } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types';
import type { ConfigItem } from '@nebula-studio/contracts/system';

export type { ConfigItem };

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, value);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const configApi = {
  list(
    params: { scope?: string; tenantId?: string; group?: string } = {},
  ): Promise<ApiResponse<ConfigItem[]>> {
    return configRequest(buildQuery(params));
  },

  get(
    key: string,
    scope = 'GLOBAL',
    tenantId?: string,
  ): Promise<ApiResponse<ConfigItem>> {
    return configRequest(
      `/${encodeURIComponent(key)}${buildQuery({ scope, tenantId })}`,
    );
  },

  save(body: Partial<ConfigItem>): Promise<ApiResponse<ConfigItem>> {
    return configRequest('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  delete(
    key: string,
    scope = 'GLOBAL',
    tenantId?: string,
  ): Promise<ApiResponse<void>> {
    return configRequest(
      `/${encodeURIComponent(key)}${buildQuery({ scope, tenantId })}`,
      { method: 'DELETE' },
    );
  },
};
