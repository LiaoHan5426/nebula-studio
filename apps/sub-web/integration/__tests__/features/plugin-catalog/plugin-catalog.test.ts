import { describe, expect, it } from 'vitest';

import {
  buildNodeSchemasFromCatalog,
  mapPluginCatalogItem,
} from '@/features/plugin-catalog/mappers';
import { readPluginConfigFields } from '@/features/plugin-catalog/schema';

describe('plugin catalog schema', () => {
  it.each([
    [
      'http',
      { connectTimeout: 'seconds', socketTimeout: 'seconds' },
      ['connectTimeout', 'socketTimeout'],
    ],
    [
      'mysql',
      {
        jdbcUrlTemplate: 'jdbc:mysql://host:port/database',
        driver: 'com.mysql.cj.jdbc.Driver',
      },
      ['jdbcUrlTemplate', 'driver'],
    ],
    [
      'postgresql',
      {
        jdbcUrlTemplate: 'jdbc:postgresql://host:port/database',
        driver: 'org.postgresql.Driver',
      },
      ['jdbcUrlTemplate', 'driver'],
    ],
  ])('builds %s connector fields from configSchema', (_name, schema, keys) => {
    expect(readPluginConfigFields(schema).map((field) => field.key)).toEqual(
      keys,
    );
  });

  it('uses platform identity and Camel capabilities in one view model', () => {
    const result = mapPluginCatalogItem({
      pluginId: 'http-plugin',
      pluginName: 'HTTP Plugin',
      pluginVersion: '1.0.0',
      label: 'HTTP Connector',
      pluginCategory: 'protocol',
      connectorId: 'http-connector',
      configSchema: { connectTimeout: 'seconds' },
      nodeSchema: { kind: 'http-call' },
    });

    expect(result).toMatchObject({
      id: 'http-plugin',
      name: 'HTTP Connector',
      connectorId: 'http-connector',
      nodeKind: 'http-call',
    });
    expect(result.capabilities).toEqual(['CONNECTOR', 'CONFIG_SCHEMA']);
  });

  it('generates DAG schemas for built-in connector plugins', () => {
    const schemas = buildNodeSchemasFromCatalog([
      {
        pluginId: 'mysql-plugin',
        pluginName: 'MySQL',
        pluginVersion: '1.0.0',
        connectorId: 'mysql-connector',
        pluginCategory: 'database',
        configSchema: { database: { type: 'string', required: true } },
        nodeSchema: {
          fields: [
            {
              key: 'query',
              label: 'SQL 查询',
              type: 'text',
              required: true,
            },
          ],
        },
      },
    ]);

    expect(schemas['mysql-connector']?.fields).toEqual([
      {
        key: 'query',
        label: 'SQL 查询',
        type: 'text',
        required: true,
        options: undefined,
      },
    ]);
  });
});
