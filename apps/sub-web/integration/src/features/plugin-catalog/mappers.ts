import type { PluginCatalogItem } from '@nebula-studio/contracts/integration';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import {
  readNodeKind,
  readPluginConfigFields,
  readPluginNodeFields,
} from './schema';
import type { PluginCatalogViewModel } from './types';

export function mapPluginCatalogItem(
  item: PluginCatalogItem,
): PluginCatalogViewModel {
  const category = String(item.pluginCategory || 'general').toLowerCase();
  const configFields = readPluginConfigFields(item.configSchema);
  return {
    id: item.pluginId,
    name: item.label || item.pluginName,
    version: item.pluginVersion,
    category,
    connectorId: item.connectorId,
    description: item.connectorId
      ? `提供 ${item.connectorId} 连接能力，配置由插件 Schema 驱动。`
      : '提供可安装的 Nebula 扩展能力。',
    configFields,
    nodeKind: readNodeKind(item.nodeSchema ?? item.configSchema),
    capabilities: [
      ...(item.connectorId ? ['CONNECTOR'] : []),
      ...(configFields.length ? ['CONFIG_SCHEMA'] : []),
    ],
    source: item,
  };
}

export function isDagOrchestrationPlugin(
  item: Pick<
    PluginCatalogItem,
    'connectorId' | 'configSchema' | 'nodeSchema' | 'pluginCategory'
  >,
): boolean {
  return Boolean(item.connectorId || item.nodeSchema || item.configSchema);
}

export function buildNodeSchemasFromCatalog(
  items: PluginCatalogItem[] = [],
): Record<string, PluginNodeSchema> {
  const schemas: Record<string, PluginNodeSchema> = {
    INTERFACE: { label: '原子服务调用', fields: [] },
  };
  for (const item of items) {
    if (!isDagOrchestrationPlugin(item)) continue;
    const id = String(item.connectorId ?? item.pluginId);
    schemas[id] = {
      label: String(item.label ?? item.pluginName ?? id),
      fields: readPluginNodeFields(item.nodeSchema ?? item.configSchema),
    };
  }
  return schemas;
}
