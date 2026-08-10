import type { ResourceDetailViewModel, ResourceKind } from './types';

export interface ResourceTypeDefinition {
  label: string;
  accent: string;
  applyLabel: string;
  detailEntries(resource: ResourceDetailViewModel): Array<{
    code?: boolean;
    label: string;
    value: string;
  }>;
}

export const resourceTypeRegistry: Record<
  ResourceKind,
  ResourceTypeDefinition
> = {
  API: {
    label: 'API 服务',
    accent: 'API',
    applyLabel: '申请 API 访问',
    detailEntries: (resource) => [
      { label: '请求方法', value: String(resource.detail.method || 'HTTP') },
      {
        label: '接入地址',
        value: String(resource.detail.endpointUri || '审批通过后提供'),
        code: true,
      },
      {
        label: '鉴权方式',
        value: String(resource.detail.authType || '按策略'),
      },
    ],
  },
  TABLE: {
    label: '数据表',
    accent: 'DATA',
    applyLabel: '申请数据访问',
    detailEntries: (resource) => [
      { label: '数据标识', value: resource.sourceId, code: true },
      { label: '同步方式', value: 'CDC / Polling' },
      { label: '访问模式', value: resource.permissionScope },
    ],
  },
  CONNECTOR: {
    label: 'Connector',
    accent: 'CONN',
    applyLabel: '申请连接能力',
    detailEntries: (resource) => [
      {
        label: 'Connector ID',
        value: String(resource.detail.connectorId || resource.sourceId),
        code: true,
      },
      { label: '配置方式', value: 'Schema 驱动配置' },
      { label: '运行环境', value: 'Nebula Camel' },
    ],
  },
};
