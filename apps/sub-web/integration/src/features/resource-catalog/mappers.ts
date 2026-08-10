import type {
  ApiInterface,
  Connector,
  PluginCatalogItem,
  ResourceRecord,
} from '@/shared/types';

import type {
  AccessRequestStatus,
  ResourceDetailViewModel,
  ResourceKind,
  ResourceSummaryViewModel,
} from './types';

function labels(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Compatibility with comma-separated labels from older records.
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapApiResource(item: ApiInterface): ResourceSummaryViewModel {
  return {
    id: `api:${item.interfaceId}`,
    sourceId: item.interfaceId,
    kind: 'API',
    name: item.interfaceName,
    description:
      item.interfaceType === 'COMPOSITE'
        ? '由多个服务步骤编排而成的复合 API。'
        : `${item.method} ${item.endpointUri}`,
    provider: item.tenantId || '平台服务团队',
    version: 'v1',
    tags: [item.interfaceType, item.method, item.authConfig.authType],
    availability:
      item.status !== 'ACTIVE'
        ? 'OFFLINE'
        : item.subscriptionMode === 'OPEN'
          ? 'AVAILABLE'
          : 'APPROVAL_REQUIRED',
    updatedAt: item.lastModifiedAt,
    detail: {
      endpointUri: item.endpointUri,
      method: item.method,
      authType: item.authConfig.authType,
      requestSchema:
        item.interfaceType === 'ATOMIC' ? item.requestSchema : undefined,
      responseSchema:
        item.interfaceType === 'ATOMIC' ? item.responseSchema : undefined,
    },
  };
}

export function mapConnectorResource(
  item: Connector,
): ResourceSummaryViewModel {
  const protocol =
    item.connectorType === 'DATABASE' ? item.databaseType : item.protocolType;
  return {
    id: `connector:${item.connectorId}`,
    sourceId: item.connectorId,
    kind: 'CONNECTOR',
    name: item.pluginName || `${protocol} Connector`,
    description: `用于接入 ${protocol} 的标准连接能力。`,
    provider: 'Nebula 插件中心',
    version: item.pluginVersion || '内置',
    tags: [item.connectorType, protocol],
    availability: item.status === 'ACTIVE' ? 'AVAILABLE' : 'OFFLINE',
    detail: { ...item },
  };
}

export function mapPluginResource(
  item: PluginCatalogItem,
): ResourceSummaryViewModel {
  return {
    id: `plugin:${item.pluginId}`,
    sourceId: item.connectorId || item.pluginId,
    kind: 'CONNECTOR',
    name: item.label || item.pluginName,
    description: `${item.pluginName} 提供的可配置连接能力。`,
    provider: 'Nebula 插件中心',
    version: item.pluginVersion,
    tags: [item.pluginCategory || 'PLUGIN'],
    availability: item.connectorId ? 'AVAILABLE' : 'UNAVAILABLE',
    detail: {
      connectorId: item.connectorId,
      configSchema: item.configSchema,
      pluginId: item.pluginId,
    },
  };
}

export function mapManagedResource(
  item: ResourceRecord,
): ResourceSummaryViewModel {
  const kind: ResourceKind =
    item.resourceType === 'API'
      ? 'API'
      : item.resourceType === 'CONNECTOR' || item.resourceType === 'PLUGIN'
        ? 'CONNECTOR'
        : 'TABLE';
  return {
    id: `resource:${item.id}`,
    sourceId: item.id,
    kind,
    name: item.name,
    description: item.description || '组织内发布的数据与集成资源。',
    provider: item.ownerId || item.tenantId || '组织资源团队',
    version: item.versionId || '当前版本',
    tags: labels(item.labels),
    availability: item.status === 'ACTIVE' ? 'APPROVAL_REQUIRED' : 'OFFLINE',
    updatedAt: item.updatedAt,
    detail: { ...item },
  };
}

export function toResourceDetail(
  resource: ResourceSummaryViewModel,
): ResourceDetailViewModel {
  return {
    ...resource,
    purpose:
      resource.kind === 'API'
        ? '在应用与自动化流程中复用标准服务能力。'
        : resource.kind === 'TABLE'
          ? '订阅业务数据变化或进行受控的数据读取。'
          : '连接外部系统并复用经过治理的集成配置。',
    owner: resource.provider,
    sla: resource.availability === 'OFFLINE' ? '当前未承诺' : '99.9%',
    permissionScope:
      resource.availability === 'AVAILABLE' ? '登录用户可用' : '按申请范围授权',
    compatibility:
      resource.kind === 'API'
        ? ['HTTP/HTTPS', 'JSON']
        : resource.kind === 'TABLE'
          ? ['CDC', 'Polling']
          : ['Nebula Camel', 'Schema-driven config'],
  };
}

export function normalizeRequestStatus(status: string): AccessRequestStatus {
  const normalized = status.toUpperCase();
  if (['ACTIVE', 'APPROVED'].includes(normalized)) return 'APPROVED';
  if (['DENIED', 'REJECTED'].includes(normalized)) return 'REJECTED';
  if (['EXPIRED'].includes(normalized)) return 'EXPIRED';
  if (['CANCELED', 'CANCELLED'].includes(normalized)) return 'CANCELLED';
  if (['NEED_INFO', 'NEEDS_INFO', 'SUPPLEMENT'].includes(normalized)) {
    return 'NEEDS_INFO';
  }
  return 'PENDING';
}

export function dedupeResources(
  resources: ResourceSummaryViewModel[],
): ResourceSummaryViewModel[] {
  const seen = new Set<string>();
  return resources.filter((item) => {
    const key = `${item.kind}:${item.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
