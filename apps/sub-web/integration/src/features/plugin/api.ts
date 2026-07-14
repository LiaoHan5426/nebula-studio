import {
  CONSOLE_BASE,
  consoleRequest,
  fetchUrl,
  parseApiResponse,
} from '@/shared/api/client';
import type { ApiResponse, PageResponse } from '@/shared/types';

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

export const pluginCatalogApi = {
  list(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return consoleRequest('/plugin-catalog');
  },
};
