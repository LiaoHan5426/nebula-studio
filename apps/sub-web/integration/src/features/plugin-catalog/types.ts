import type { PluginCatalogItem } from '@nebula-studio/contracts/integration';

export type PluginSchemaFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'password'
  | 'select';

export interface PluginSchemaField {
  key: string;
  label: string;
  type: PluginSchemaFieldType;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface PluginCatalogViewModel {
  id: string;
  name: string;
  version: string;
  category: string;
  connectorId?: string;
  description: string;
  configFields: PluginSchemaField[];
  nodeKind?: string;
  capabilities: string[];
  source: PluginCatalogItem;
}
