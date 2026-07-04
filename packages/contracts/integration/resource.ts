/**
 * @nebula-studio/contracts/integration — 资源管理域
 */

export enum ResourceType {
  API = 'API',
  CONNECTOR = 'CONNECTOR',
  PLUGIN = 'PLUGIN',
  FLOW = 'FLOW',
  DATASOURCE = 'DATASOURCE',
}

export enum ResourceStatus {
  DRAFT = 'DRAFT',
  VERSIONED = 'VERSIONED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
}

export interface ResourceRecord {
  id: string;
  name: string;
  description: string;
  resourceType: ResourceType | string;
  status: ResourceStatus | string;
  tenantId: string;
  ownerId: string;
  versionId: string;
  labels: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreateRequest {
  name: string;
  description?: string;
  resourceType: ResourceType | string;
  tenantId: string;
  labels?: string;
}

export interface ResourceUpdateRequest {
  name?: string;
  description?: string;
  status?: ResourceStatus | string;
  labels?: string;
  versionId?: string;
}

export interface ResourceQueryParams {
  tenantId: string;
  resourceType?: string;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}
