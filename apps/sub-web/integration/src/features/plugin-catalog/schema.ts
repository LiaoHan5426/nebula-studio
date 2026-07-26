import type { PluginNodeField } from '@nebula-studio/nebula-low-render';

import type { PluginSchemaField, PluginSchemaFieldType } from './types';

function titleFromKey(key: string): string {
  return key
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll(/[-_]/g, ' ')
    .replace(/^./, (value) => value.toUpperCase());
}

function normalizeType(value: unknown, key: string): PluginSchemaFieldType {
  const type = String(value ?? '').toLowerCase();
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'password' || /password|secret|token/i.test(key)) {
    return 'password';
  }
  if (type === 'select' || type === 'enum') return 'select';
  return 'text';
}

function fieldFromObject(
  key: string,
  value: Record<string, unknown>,
): PluginSchemaField {
  const enumValues = Array.isArray(value.enum) ? value.enum : undefined;
  return {
    key,
    label: String(value.title ?? value.label ?? titleFromKey(key)),
    type: enumValues ? 'select' : normalizeType(value.type, key),
    required: Boolean(value.required),
    defaultValue: value.default,
    description:
      typeof value.description === 'string' ? value.description : undefined,
    options: enumValues?.map((option) => ({
      label: String(option),
      value: String(option),
    })),
  };
}

export function readPluginConfigFields(schema: unknown): PluginSchemaField[] {
  if (!schema || typeof schema !== 'object') return [];
  const record = schema as Record<string, unknown>;
  if ('fields' in record && !Array.isArray(record.fields)) return [];
  if (Array.isArray(record.fields)) {
    return record.fields
      .filter(
        (field): field is Record<string, unknown> =>
          typeof field === 'object' && field !== null,
      )
      .map((field) =>
        fieldFromObject(String(field.key ?? field.name ?? ''), field),
      )
      .filter((field) => field.key);
  }

  const properties =
    typeof record.properties === 'object' && record.properties !== null
      ? (record.properties as Record<string, unknown>)
      : record;
  const required = new Set(
    Array.isArray(record.required) ? record.required.map(String) : [],
  );
  return Object.entries(properties)
    .filter(
      ([key]) =>
        !['required', 'title', 'description', 'type', 'nodeSchema'].includes(
          key,
        ),
    )
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const field = fieldFromObject(key, value as Record<string, unknown>);
        return { ...field, required: field.required || required.has(key) };
      }
      return {
        key,
        label: titleFromKey(key),
        type: normalizeType(typeof value, key),
        required: required.has(key),
        defaultValue: value,
      } satisfies PluginSchemaField;
    });
}

export function readPluginNodeFields(schema: unknown): PluginNodeField[] {
  return readPluginConfigFields(schema).map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type === 'password' ? 'text' : field.type,
    required: field.required,
    options: field.options,
  })) as PluginNodeField[];
}

export function readNodeKind(schema: unknown): string | undefined {
  if (!schema || typeof schema !== 'object') return undefined;
  const record = schema as Record<string, unknown>;
  const nodeSchema =
    typeof record.nodeSchema === 'object' && record.nodeSchema !== null
      ? (record.nodeSchema as Record<string, unknown>)
      : undefined;
  const kind = nodeSchema?.kind ?? record.kind;
  return typeof kind === 'string' && kind ? kind : undefined;
}
