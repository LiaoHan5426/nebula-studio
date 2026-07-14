import { consoleRequest, monitorRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  DagDefinitionRecord,
  PageResponse,
} from '@/shared/types';

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
