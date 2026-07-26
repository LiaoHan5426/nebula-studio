import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

export {
  buildNodeSchemasFromCatalog,
  isDagOrchestrationPlugin,
} from '@/features/plugin-catalog/mappers';
export { readPluginNodeFields } from '@/features/plugin-catalog/schema';

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
