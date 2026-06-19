import { integrationRequest } from '@/shared/api/client';
import type {
  ApiInterface,
  ApiResponse,
  Connector,
  DataSourceConfig,
  DatabaseConfig,
  PageResponse,
  ProtocolConfig,
  ValidationResult,
} from '@/shared/types';

function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  return integrationRequest<T>(endpoint, options);
}

/** Legacy integration CRUD on console :8080 */
export const interfaceApi = {
  create(intf: Partial<ApiInterface>): Promise<ApiResponse<ApiInterface>> {
    return request('/interfaces', {
      method: 'POST',
      body: JSON.stringify(intf),
    });
  },

  list(
    params: {
      page?: number;
      pageSize?: number;
      interfaceType?: string;
      status?: string;
      scope?: 'authorizable';
    } = {},
  ): Promise<ApiResponse<PageResponse<ApiInterface>>> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request(`/interfaces?${query}`);
  },

  get(interfaceId: string): Promise<ApiResponse<ApiInterface>> {
    return request(`/interfaces/${interfaceId}`);
  },

  update(
    interfaceId: string,
    intf: Partial<ApiInterface>,
  ): Promise<ApiResponse<ApiInterface>> {
    return request(`/interfaces/${interfaceId}`, {
      method: 'PUT',
      body: JSON.stringify(intf),
    });
  },

  delete(interfaceId: string): Promise<ApiResponse<void>> {
    return request(`/interfaces/${interfaceId}`, { method: 'DELETE' });
  },

  getXml(interfaceId: string): Promise<ApiResponse<string>> {
    return request(`/interfaces/${interfaceId}/xml`);
  },

  saveXml(interfaceId: string, xml: string): Promise<ApiResponse<void>> {
    return request(`/interfaces/${interfaceId}/xml`, {
      method: 'POST',
      body: JSON.stringify({ xml }),
    });
  },
};

export const connectorApi = {
  list(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors');
  },

  getDatabaseConnectors(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors?type=DATABASE');
  },

  getProtocolConnectors(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors?type=PROTOCOL');
  },

  validateDatabase(
    connectorId: string,
    config: DatabaseConfig,
  ): Promise<ApiResponse<ValidationResult>> {
    return request(`/connectors/${connectorId}/validate-database`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  validateProtocol(
    connectorId: string,
    config: ProtocolConfig,
  ): Promise<ApiResponse<ValidationResult>> {
    return request(`/connectors/${connectorId}/validate-protocol`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

export const dataSourceApi = {
  create(config: DataSourceConfig): Promise<ApiResponse<DataSourceConfig>> {
    return request('/datasources', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  list(): Promise<ApiResponse<DataSourceConfig[]>> {
    return request('/datasources');
  },

  get(dataSourceId: string): Promise<ApiResponse<DataSourceConfig>> {
    return request(`/datasources/${dataSourceId}`);
  },

  update(
    dataSourceId: string,
    config: Partial<DataSourceConfig>,
  ): Promise<ApiResponse<DataSourceConfig>> {
    return request(`/datasources/${dataSourceId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  delete(dataSourceId: string): Promise<ApiResponse<void>> {
    return request(`/datasources/${dataSourceId}`, { method: 'DELETE' });
  },

  testConnection(dataSourceId: string): Promise<ApiResponse<ValidationResult>> {
    return request(`/datasources/${dataSourceId}/test`, { method: 'POST' });
  },
};

export {
  subscriptionApi,
  tenantApi,
  pluginApi,
  subscriptionRequestApi,
  monitorApi,
  governanceApi,
} from '@/shared/api/consoleApi';

export {
  gatewayRequest,
  buildGatewayUrl,
  triggerDemoChange,
} from '@/shared/api/executorApi';
