import {
  CONSOLE_BASE,
  consoleRequest,
  fetchUrl,
  governanceRequest,
  monitorRequest,
  parseApiResponse,
} from '@/shared/api/client';
import type {
  ApiResponse,
  DagDefinitionRecord,
  PageResponse,
  SubscriptionConfig,
  TableSubscription,
  TenantContext,
} from '@/shared/types';
import type { GrantScheduleType } from '@/shared/grant/schedule';

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

export interface PluginRecord {
  pluginId: string;
  pluginName: string;
  pluginVersion?: string;
  pluginType?: string;
  pluginCategory?: string;
  connectorId?: string;
  status?: string;
  description?: string;
  activatedAt?: string;
  createdBy?: string;
  transitioning?: boolean;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export const pluginApi = {
  list(
    params: {
      page?: number;
      pageSize?: number;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<PluginRecord>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('size', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    return consoleRequest(`/plugin/list?${query.toString()}`);
  },

  get(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}`);
  },

  activate(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}/activate`, { method: 'POST' });
  },

  deactivate(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}/deactivate`, { method: 'POST' });
  },

  rejectActivation(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}/reject-activation`, {
      method: 'POST',
    });
  },

  install(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}/install`, { method: 'POST' });
  },

  test(pluginId: string): Promise<ApiResponse<PluginRecord>> {
    return consoleRequest(`/plugin/${pluginId}/test`, { method: 'POST' });
  },

  uninstall(pluginId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/plugin/${pluginId}`, { method: 'DELETE' });
  },

  uploadJar(form: FormData): Promise<ApiResponse<PluginRecord>> {
    return fetchUrl(`${CONSOLE_BASE}/plugin/upload-jar`, {
      method: 'POST',
      body: form,
    }).then((response) => parseApiResponse<PluginRecord>(response));
  },
};

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

export const monitorApi = {
  callLogs(
    params: {
      tenantId?: string;
      page?: number;
      pageSize?: number;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams();
    if (params.tenantId) query.set('tenantId', params.tenantId);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('size', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    return monitorRequest(`/call-logs?${query.toString()}`);
  },

  topologyNodes(
    tenantId: string,
  ): Promise<ApiResponse<Record<string, unknown>[]>> {
    return monitorRequest(
      `/topology/nodes?tenantId=${encodeURIComponent(tenantId)}`,
    );
  },

  topologyEdges(
    tenantId: string,
  ): Promise<ApiResponse<Record<string, unknown>[]>> {
    return monitorRequest(
      `/topology/edges?tenantId=${encodeURIComponent(tenantId)}`,
    );
  },

  interfaceRanking(
    tenantId: string,
    days = 7,
    limit = 20,
  ): Promise<ApiResponse<Record<string, unknown>[]>> {
    return monitorRequest(
      `/statistics/interface-ranking?tenantId=${encodeURIComponent(tenantId)}&days=${days}&limit=${limit}`,
    );
  },
};

export const governanceApi = {
  rateLimitList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/rate-limit/list?${query.toString()}`);
  },

  rateLimitCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/rate-limit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  rateLimitUpdate(
    ruleId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/rate-limit/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  rateLimitDelete(ruleId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/rate-limit/${ruleId}`, { method: 'DELETE' });
  },

  circuitBreakerList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/circuit-breaker/list?${query.toString()}`);
  },

  circuitBreakerCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/circuit-breaker', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  circuitBreakerUpdate(
    interfaceId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/circuit-breaker/${interfaceId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  whitelistList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/whitelist/list?${query.toString()}`);
  },

  whitelistCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/whitelist', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  whitelistUpdate(
    ruleId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/whitelist/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  whitelistDelete(ruleId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/whitelist/${ruleId}`, { method: 'DELETE' });
  },
};

export const dagApi = {
  list(tenantId?: string): Promise<ApiResponse<DagDefinitionRecord[]>> {
    const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
    return consoleRequest(`/dag/list${query}`);
  },

  get(dagId: string): Promise<ApiResponse<DagDefinitionRecord>> {
    return consoleRequest(`/dag/${dagId}`);
  },

  create(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<DagDefinitionRecord>> {
    return consoleRequest('/dag', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    dagId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return consoleRequest(`/dag/${dagId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  publish(dagId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return consoleRequest(`/dag/${dagId}/publish`, { method: 'POST' });
  },

  delete(dagId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return consoleRequest(`/dag/${dagId}`, { method: 'DELETE' });
  },

  plan(dagId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return consoleRequest(`/dag/${dagId}/plan`, { method: 'POST' });
  },
};

export const pluginCatalogApi = {
  list(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return consoleRequest('/plugin-catalog');
  },
};
