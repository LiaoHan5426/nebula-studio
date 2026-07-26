/**
 * Plugin lifecycle and catalog contracts exposed by nebula-camel-console.
 *
 * Source DTOs:
 * - PluginView
 * - PluginCatalogItemView
 */

export type PluginStatus =
  | 'UPLOADED'
  | 'INSTALLED'
  | 'TESTED'
  | 'FAILED'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'INACTIVE'
  | (string & {});

export interface PluginRecord {
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
  pluginFilePath?: string;
  pluginFileSize?: number;
  status: PluginStatus;
  tenantId?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  description?: string;
  installedAt?: string;
  activatedAt?: string;
  testedAt?: string;
  testResult?: Record<string, unknown>;
  transitioning: boolean;
  pluginCategory?: string;
  connectorId?: string;
  pf4jPluginId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PluginCatalogItem {
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
  connectorId?: string;
  pluginCategory?: string;
  label?: string;
  configSchema?: Record<string, unknown>;
}
