import { describe, expect, it } from 'vitest';

import {
  buildNodeSchemasFromCatalog,
  isDagOrchestrationPlugin,
  readPluginNodeFields,
  withAtomicInterfaceOptions,
} from '@/features/flows/dagNodeSchemas';

describe('dag node schemas', () => {
  it('reads plugin config fields from catalog schema', () => {
    const fields = readPluginNodeFields({
      fields: [{ key: 'url', label: 'URL', type: 'text' }],
    });
    expect(fields).toHaveLength(1);
    expect(fields[0]?.key).toBe('url');
  });

  it('ignores invalid config schema payloads', () => {
    expect(readPluginNodeFields(null)).toEqual([]);
    expect(readPluginNodeFields({ fields: 'bad' })).toEqual([]);
  });

  it('builds INTERFACE default and plugin entries', () => {
    const schemas = buildNodeSchemasFromCatalog([
      {
        pluginId: 'http-client',
        pluginName: 'HTTP Client',
        pluginCategory: 'general',
        configSchema: {
          fields: [{ key: 'endpoint', label: 'Endpoint', type: 'text' }],
        },
      },
    ]);

    expect(schemas.INTERFACE?.label).toBe('原子服务调用');
    expect(schemas['http-client']?.label).toBe('HTTP Client');
    expect(schemas['http-client']?.fields).toHaveLength(1);
  });

  it('excludes database and protocol adapter plugins from DAG palette', () => {
    expect(
      isDagOrchestrationPlugin({
        pluginId: 'mysql-connector',
        pluginCategory: 'database',
      }),
    ).toBe(false);
    expect(
      isDagOrchestrationPlugin({
        pluginId: 'http-connector',
        pluginCategory: 'protocol',
      }),
    ).toBe(false);

    const schemas = buildNodeSchemasFromCatalog([
      {
        pluginId: 'mysql-connector',
        pluginName: 'MySQL',
        pluginCategory: 'database',
      },
      {
        pluginId: 'http-connector',
        pluginName: 'HTTP',
        pluginCategory: 'protocol',
      },
      {
        pluginId: 'transform',
        pluginName: 'Transform',
        pluginCategory: 'general',
        configSchema: {
          fields: [{ key: 'expr', label: 'Expression', type: 'text' }],
        },
      },
    ]);

    expect(schemas['mysql-connector']).toBeUndefined();
    expect(schemas['http-connector']).toBeUndefined();
    expect(schemas.transform?.label).toBe('Transform');
  });

  it('adds atomic interface options to INTERFACE node', () => {
    const schemas = withAtomicInterfaceOptions(buildNodeSchemasFromCatalog(), [
      {
        interfaceId: 'intf-1',
        interfaceName: 'Order API',
        endpointUri: '/orders',
      },
    ]);

    const interfaceField = schemas.INTERFACE?.fields?.find(
      (field) => field.key === 'interfaceId',
    );
    expect(interfaceField?.type).toBe('select');
    expect(interfaceField?.options).toEqual([
      { label: 'Order API', value: 'intf-1' },
    ]);
  });
});
