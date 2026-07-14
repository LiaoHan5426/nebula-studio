import { consoleRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  PageResponse,
  SubscriptionConfig,
  TableSubscription,
} from '@/shared/types';

export interface SubscriptionRequestRecord {
  requestId: string;
  tenantId: string;
  userId?: string;
  interfaceId: string;
  requestType: string;
  status: string;
  reason?: string;
  createdAt?: string;
}

export const subscriptionApi = {
  create(
    tenantId: string,
    config: SubscriptionConfig,
  ): Promise<ApiResponse<TableSubscription>> {
    return consoleRequest('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({
        tenantId,
        dataSourceId: config.dataSourceId,
        tableName: config.tableName,
        subscribeType: config.subscribeType,
        pollingConfig: config.pollingConfig,
        cdcConfig: config.cdcConfig,
        columns: config.columns,
        eventTypes: config.eventTypes,
      }),
    });
  },

  list(
    params: {
      page?: number;
      pageSize?: number;
      status?: string;
      tenantId?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<TableSubscription>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('size', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    if (params.tenantId) query.set('tenantId', params.tenantId);
    return consoleRequest(`/subscription/list?${query.toString()}`);
  },

  get(subscriptionId: string): Promise<ApiResponse<TableSubscription>> {
    return consoleRequest(`/subscription/${subscriptionId}`);
  },

  delete(subscriptionId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/subscription/${subscriptionId}`, {
      method: 'DELETE',
    });
  },

  pause(subscriptionId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/subscription/${subscriptionId}/pause`, {
      method: 'POST',
    });
  },

  resume(subscriptionId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/subscription/${subscriptionId}/resume`, {
      method: 'POST',
    });
  },

  activate(subscriptionId: string): Promise<ApiResponse<void>> {
    return this.resume(subscriptionId);
  },

  deactivate(subscriptionId: string): Promise<ApiResponse<void>> {
    return this.pause(subscriptionId);
  },
};

export const subscriptionRequestApi = {
  list(
    params: {
      page?: number;
      pageSize?: number;
      status?: string;
      tenantId?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<SubscriptionRequestRecord>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    if (params.tenantId) query.set('tenantId', params.tenantId);
    return consoleRequest(`/subscription-request?${query.toString()}`);
  },

  approve(
    requestId: string,
    options: {
      approvedBy?: string;
      expiresAt?: string;
      maxCalls?: number;
      rateLimitMax?: number;
      rateLimitWindowSeconds?: number;
      scheduleType?: string;
      scheduleStartTime?: string;
      scheduleEndTime?: string;
      scheduleTimezone?: string;
    } = {},
  ): Promise<ApiResponse<SubscriptionRequestRecord>> {
    const { approvedBy = 'admin', ...grantFields } = options;
    return consoleRequest(`/subscription-request/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy, ...grantFields }),
    });
  },

  reject(
    requestId: string,
    reason: string,
    approvedBy = 'admin',
  ): Promise<ApiResponse<SubscriptionRequestRecord>> {
    return consoleRequest(`/subscription-request/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy, reason }),
    });
  },
};
