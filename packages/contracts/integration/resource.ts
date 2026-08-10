/**
 * @nebula-studio/contracts/integration — 资源管理域
 */

export enum ResourceType {
  API = 'API',
  CONNECTOR = 'CONNECTOR',
  DATASOURCE = 'DATASOURCE',
  FLOW = 'FLOW',
  PLUGIN = 'PLUGIN',
}

export enum ResourceStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
  DRAFT = 'DRAFT',
  INACTIVE = 'INACTIVE',
  VERSIONED = 'VERSIONED',
}

export interface ResourceRecord {
  createdAt: string;
  createdBy: string;
  description: string;
  id: string;
  labels: string;
  name: string;
  ownerId: string;
  resourceType: ResourceType | string;
  status: ResourceStatus | string;
  tenantId: string;
  updatedAt: string;
  versionId: string;
}

export interface ResourceCreateRequest {
  description?: string;
  labels?: string;
  name: string;
  resourceType: ResourceType | string;
  tenantId: string;
}

export interface ResourceUpdateRequest {
  description?: string;
  labels?: string;
  name?: string;
  status?: ResourceStatus | string;
  versionId?: string;
}

export interface ResourceQueryParams {
  keyword?: string;
  page?: number;
  resourceType?: string;
  size?: number;
  status?: string;
  tenantId: string;
}
