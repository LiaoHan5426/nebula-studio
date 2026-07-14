import { consoleRequest } from '@/shared/api/client';
import type { ApiResponse, PageResponse, TenantContext } from '@/shared/types';
import type { GrantScheduleType } from '@/shared/grant/schedule';

export interface InterfaceGrantRecord {
  grantId: string;
  tenantId: string;
  interfaceId: string;
  grantedBy?: string;
  expiresAt?: string | null;
  maxCalls?: number | null;
  callCount?: number;
  rateLimitMax?: number | null;
  rateLimitWindowSeconds?: number | null;
  scheduleType?: GrantScheduleType | string | null;
  scheduleStartTime?: string | null;
  scheduleEndTime?: string | null;
  scheduleTimezone?: string | null;
  scheduleLabel?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantRecord {
  tenantId: string;
  tenantName: string;
  userId?: string;
  slug?: string;
  status: string;
  authConfig?: Record<string, unknown>;
  allowedInterfaces?: string[];
  interfaceGrants?: InterfaceGrantRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorizeInterfaceOptions {
  expiresAt?: string | null;
  maxCalls?: number | null;
  rateLimitMax?: number | null;
  rateLimitWindowSeconds?: number | null;
  scheduleType?: GrantScheduleType | string | null;
  scheduleStartTime?: string | null;
  scheduleEndTime?: string | null;
  scheduleTimezone?: string | null;
}

export const tenantApi = {
  get(tenantId: string): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest(`/tenant/${tenantId}`);
  },

  getCurrent(): Promise<ApiResponse<TenantContext>> {
    const tenantId = localStorage.getItem('tenant_id');
    if (!tenantId) {
      return Promise.resolve({
        code: 404,
        isSuccess: false,
        error: 'No tenant selected',
        data: { tenantId: '', tenantName: '', allowedConnectors: [] },
      });
    }
    return this.get(tenantId).then((response) => ({
      ...response,
      data: {
        tenantId: response.data.tenantId,
        tenantName: response.data.tenantName ?? response.data.tenantId,
        allowedConnectors: [],
      },
    }));
  },

  list(
    page = 1,
    pageSize = 20,
    status?: string,
  ): Promise<ApiResponse<PageResponse<TenantRecord>>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
    });
    if (status) params.set('status', status);
    return consoleRequest(`/tenant/list?${params.toString()}`);
  },

  /** 当前用户绑定的对接租户（仅内部 API 上下文，不在 UI 展示） */
  mine(): Promise<ApiResponse<TenantRecord[]>> {
    return consoleRequest('/tenant/mine');
  },

  create(request: Record<string, unknown>): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest('/tenant/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  update(
    tenantId: string,
    request: Record<string, unknown>,
  ): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest(`/tenant/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  delete(tenantId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/tenant/${tenantId}`, { method: 'DELETE' });
  },

  disable(tenantId: string): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest(`/tenant/${tenantId}/disable`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  enable(tenantId: string): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest(`/tenant/${tenantId}/enable`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  authorizeInterface(
    tenantId: string,
    interfaceIds: string[],
    options?: AuthorizeInterfaceOptions,
  ): Promise<ApiResponse<TenantRecord>> {
    const body: Record<string, unknown> = { interfaces: interfaceIds };
    if (options) {
      if (options.expiresAt) body.expiresAt = options.expiresAt;
      if (options.maxCalls !== undefined && options.maxCalls !== null) {
        body.maxCalls = options.maxCalls;
      }
      if (options.rateLimitMax !== undefined && options.rateLimitMax !== null) {
        body.rateLimitMax = options.rateLimitMax;
      }
      if (
        options.rateLimitWindowSeconds !== undefined &&
        options.rateLimitWindowSeconds !== null
      ) {
        body.rateLimitWindowSeconds = options.rateLimitWindowSeconds;
      }
      if (options.scheduleType) body.scheduleType = options.scheduleType;
      if (options.scheduleStartTime)
        body.scheduleStartTime = options.scheduleStartTime;
      if (options.scheduleEndTime)
        body.scheduleEndTime = options.scheduleEndTime;
      if (options.scheduleTimezone)
        body.scheduleTimezone = options.scheduleTimezone;
      body.grants = interfaceIds.map((interfaceId) => ({
        interfaceId,
        ...options,
      }));
    }
    return consoleRequest(`/tenant/${tenantId}/authorize-interface`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  revokeInterface(
    tenantId: string,
    interfaceId: string,
  ): Promise<ApiResponse<TenantRecord>> {
    return consoleRequest(
      `/tenant/${tenantId}/revoke-interface/${interfaceId}`,
      { method: 'POST' },
    );
  },
};
