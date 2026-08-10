/**
 * Plugin lifecycle and catalog contracts exposed by nebula-camel-console.
 *
 * Source DTOs:
 * - PluginView
 * - PluginCatalogItemView
 */

export type PluginStatus =
  | 'ACTIVE'
  | 'FAILED'
  | 'INACTIVE'
  | 'INSTALLED'
  | 'PENDING_REVIEW'
  | 'TESTED'
  | 'UPLOADED'
  | (string & {});

export interface PluginRecord {
  activatedAt?: string;
  connectorId?: string;
  createdAt: string;
  createdBy?: string;
  description?: string;
  installedAt?: string;
  metadata?: Record<string, unknown>;
  pf4jPluginId?: string;
  pluginCategory?: string;
  pluginFilePath?: string;
  pluginFileSize?: number;
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
  status: PluginStatus;
  tenantId?: string;
  testedAt?: string;
  testResult?: Record<string, unknown>;
  transitioning: boolean;
  updatedAt: string;
}

export interface PluginCatalogItem {
  configSchema?: Record<string, unknown>;
  connectorId?: string;
  label?: string;
  nodeSchema?: Record<string, unknown>;
  pluginCategory?: string;
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
}
