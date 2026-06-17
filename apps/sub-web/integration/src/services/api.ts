import type {
  ApiResponse,
  PageResponse,
  TableSubscription,
  SubscriptionConfig,
  ApiInterface,
  Connector,
  DataSourceConfig,
  ValidationResult,
  DatabaseConfig,
  ProtocolConfig,
} from '../types';

const API_BASE_URL = '/api/integration';

// 请求工具函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============ 库表订阅 API ============

export const subscriptionApi = {
  // 创建订阅
  async create(
    config: SubscriptionConfig,
  ): Promise<ApiResponse<TableSubscription>> {
    return request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // 获取订阅列表
  async list(
    params: {
      page?: number;
      pageSize?: number;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<TableSubscription>>> {
    const query = new URLSearchParams(params as any).toString();
    return request(`/subscriptions?${query}`);
  },

  // 获取订阅详情
  async get(subscriptionId: string): Promise<ApiResponse<TableSubscription>> {
    return request(`/subscriptions/${subscriptionId}`);
  },

  // 更新订阅
  async update(
    subscriptionId: string,
    config: SubscriptionConfig,
  ): Promise<ApiResponse<TableSubscription>> {
    return request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // 删除订阅
  async delete(subscriptionId: string): Promise<ApiResponse<void>> {
    return request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  },

  // 暂停订阅
  async pause(subscriptionId: string): Promise<ApiResponse<void>> {
    return request(`/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
    });
  },

  // 恢复订阅
  async resume(subscriptionId: string): Promise<ApiResponse<void>> {
    return request(`/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
    });
  },

  // 激活订阅
  async activate(subscriptionId: string): Promise<ApiResponse<void>> {
    return request(`/subscriptions/${subscriptionId}/activate`, {
      method: 'POST',
    });
  },

  // 停用订阅
  async deactivate(subscriptionId: string): Promise<ApiResponse<void>> {
    return request(`/subscriptions/${subscriptionId}/deactivate`, {
      method: 'POST',
    });
  },
};

// ============ 接口管理 API ============

export const interfaceApi = {
  // 创建接口
  async create(
    intf: Partial<ApiInterface>,
  ): Promise<ApiResponse<ApiInterface>> {
    return request('/interfaces', {
      method: 'POST',
      body: JSON.stringify(intf),
    });
  },

  // 获取接口列表
  async list(
    params: {
      page?: number;
      pageSize?: number;
      interfaceType?: string;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResponse<ApiInterface>>> {
    const query = new URLSearchParams(params as any).toString();
    return request(`/interfaces?${query}`);
  },

  // 获取接口详情
  async get(interfaceId: string): Promise<ApiResponse<ApiInterface>> {
    return request(`/interfaces/${interfaceId}`);
  },

  // 更新接口
  async update(
    interfaceId: string,
    intf: Partial<ApiInterface>,
  ): Promise<ApiResponse<ApiInterface>> {
    return request(`/interfaces/${interfaceId}`, {
      method: 'PUT',
      body: JSON.stringify(intf),
    });
  },

  // 删除接口
  async delete(interfaceId: string): Promise<ApiResponse<void>> {
    return request(`/interfaces/${interfaceId}`, {
      method: 'DELETE',
    });
  },

  // 获取 BPMN XML（组合接口）
  async getXml(interfaceId: string): Promise<ApiResponse<string>> {
    return request(`/interfaces/${interfaceId}/xml`);
  },

  // 保存 BPMN XML（组合接口）
  async saveXml(interfaceId: string, xml: string): Promise<ApiResponse<void>> {
    return request(`/interfaces/${interfaceId}/xml`, {
      method: 'POST',
      body: JSON.stringify({ xml }),
    });
  },

  // 执行接口
  async execute(interfaceId: string, data: any): Promise<ApiResponse<any>> {
    return request(`/interfaces/${interfaceId}/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 测试接口
  async test(interfaceId: string, data: any): Promise<ApiResponse<any>> {
    return request(`/interfaces/${interfaceId}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ 连接器管理 API ============

export const connectorApi = {
  // 获取所有连接器
  async list(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors');
  },

  // 获取数据库连接器
  async getDatabaseConnectors(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors?type=DATABASE');
  },

  // 获取协议连接器
  async getProtocolConnectors(): Promise<ApiResponse<Connector[]>> {
    return request('/connectors?type=PROTOCOL');
  },

  // 验证数据库连接
  async validateDatabase(
    connectorId: string,
    config: DatabaseConfig,
  ): Promise<ApiResponse<ValidationResult>> {
    return request(`/connectors/${connectorId}/validate-database`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // 验证协议端点
  async validateProtocol(
    connectorId: string,
    config: ProtocolConfig,
  ): Promise<ApiResponse<ValidationResult>> {
    return request(`/connectors/${connectorId}/validate-protocol`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ============ 数据源管理 API ============

export const dataSourceApi = {
  // 创建数据源
  async create(
    config: DataSourceConfig,
  ): Promise<ApiResponse<DataSourceConfig>> {
    return request('/datasources', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // 获取数据源列表
  async list(): Promise<ApiResponse<DataSourceConfig[]>> {
    return request('/datasources');
  },

  // 获取数据源详情
  async get(dataSourceId: string): Promise<ApiResponse<DataSourceConfig>> {
    return request(`/datasources/${dataSourceId}`);
  },

  // 更新数据源
  async update(
    dataSourceId: string,
    config: Partial<DataSourceConfig>,
  ): Promise<ApiResponse<DataSourceConfig>> {
    return request(`/datasources/${dataSourceId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // 删除数据源
  async delete(dataSourceId: string): Promise<ApiResponse<void>> {
    return request(`/datasources/${dataSourceId}`, {
      method: 'DELETE',
    });
  },

  // 测试数据源连接
  async testConnection(
    dataSourceId: string,
  ): Promise<ApiResponse<ValidationResult>> {
    return request(`/datasources/${dataSourceId}/test`, {
      method: 'POST',
    });
  },
};

// ============ 租户管理 API ============

export const tenantApi = {
  // 获取当前租户信息
  async getCurrent(): Promise<ApiResponse<any>> {
    return request('/tenant/current');
  },

  // 切换租户
  async switch(tenantId: string): Promise<ApiResponse<void>> {
    return request('/tenant/switch', {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
  },
};
