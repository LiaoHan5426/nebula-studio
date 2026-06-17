import { apiRequest, FLOWS_BASE } from '@/shared/api/client';
import type {
  ApiResponse,
  FlowCreateRequest,
  FlowDefinition,
  MybatisPage,
} from '@/shared/types';

function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(FLOWS_BASE, endpoint, options);
}

export const flowsApi = {
  list(
    params: {
      page?: number;
      pageSize?: number;
      category?: string;
      tenantId?: string;
      status?: string;
    } = {},
  ): Promise<ApiResponse<MybatisPage<FlowDefinition>>> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request(`?${query}`);
  },

  get(id: string): Promise<ApiResponse<FlowDefinition>> {
    return request(`/${id}`);
  },

  create(body: FlowCreateRequest): Promise<ApiResponse<FlowDefinition>> {
    return request('', { method: 'POST', body: JSON.stringify(body) });
  },

  update(
    id: string,
    body: Partial<FlowCreateRequest>,
  ): Promise<ApiResponse<FlowDefinition>> {
    return request(`/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return request(`/${id}`, { method: 'DELETE' });
  },

  getXml(id: string): Promise<ApiResponse<string>> {
    return request(`/${id}/xml`);
  },

  saveXml(id: string, bpmnXml: string): Promise<ApiResponse<void>> {
    return request(`/${id}/xml`, {
      method: 'PUT',
      body: JSON.stringify({ bpmnXml }),
    });
  },

  publish(id: string): Promise<ApiResponse<FlowDefinition>> {
    return request(`/${id}/publish`, { method: 'POST' });
  },

  execute(
    id: string,
    variables?: Record<string, unknown>,
  ): Promise<ApiResponse<unknown>> {
    return request(`/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(variables ?? {}),
    });
  },
};
