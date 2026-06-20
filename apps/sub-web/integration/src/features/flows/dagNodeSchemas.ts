import type {
  PluginNodeField,
  PluginNodeSchema,
} from '@nebula-studio/nebula-low-render';

export function readPluginNodeFields(configSchema: unknown): PluginNodeField[] {
  if (!configSchema || typeof configSchema !== 'object') return [];
  const fields = (configSchema as { fields?: unknown }).fields;
  return Array.isArray(fields) ? (fields as PluginNodeField[]) : [];
}

export interface PluginCatalogItem {
  connectorId?: string;
  pluginId?: string;
  label?: string;
  pluginName?: string;
  pluginCategory?: string;
  configSchema?: unknown;
}

const DAG_EXCLUDED_PLUGIN_CATEGORIES = new Set(['database', 'protocol']);

export function isDagOrchestrationPlugin(item: PluginCatalogItem): boolean {
  const category = String(item.pluginCategory ?? 'general')
    .trim()
    .toLowerCase();
  return !DAG_EXCLUDED_PLUGIN_CATEGORIES.has(category);
}

export function buildNodeSchemasFromCatalog(
  items: PluginCatalogItem[] = [],
): Record<string, PluginNodeSchema> {
  const schemas: Record<string, PluginNodeSchema> = {
    INTERFACE: { label: '原子服务调用', fields: [] },
  };
  for (const item of items) {
    if (!isDagOrchestrationPlugin(item)) {
      continue;
    }
    const connectorId = String(item.connectorId ?? item.pluginId ?? 'PLUGIN');
    schemas[connectorId] = {
      label: String(item.label ?? item.pluginName ?? connectorId),
      fields: readPluginNodeFields(item.configSchema),
    };
  }
  return schemas;
}

export interface AtomicInterfaceOption {
  interfaceId: string;
  interfaceName: string;
  endpointUri?: string;
}

export function withAtomicInterfaceOptions(
  schemas: Record<string, PluginNodeSchema>,
  atomicInterfaces: AtomicInterfaceOption[] = [],
): Record<string, PluginNodeSchema> {
  const interfaceOptions = atomicInterfaces.map((item) => ({
    label: item.interfaceName,
    value: item.interfaceId,
  }));

  const baseInterface = schemas.INTERFACE ?? {
    label: '原子服务调用',
    fields: [],
  };
  const extraFields = baseInterface.fields ?? [];

  return {
    ...schemas,
    INTERFACE: {
      ...baseInterface,
      fields: [
        {
          key: 'interfaceId',
          label: '原子服务',
          type: 'select',
          required: interfaceOptions.length > 0,
          options: interfaceOptions,
        },
        ...extraFields.filter((field) => field.key !== 'interfaceId'),
      ],
    },
  };
}
