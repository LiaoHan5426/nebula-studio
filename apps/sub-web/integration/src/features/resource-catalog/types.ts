export type ResourceKind = 'API' | 'CONNECTOR' | 'TABLE';
export type ResourceAvailability =
  | 'APPROVAL_REQUIRED'
  | 'AVAILABLE'
  | 'OFFLINE'
  | 'UNAVAILABLE';

export interface ResourceSummaryViewModel {
  id: string;
  sourceId: string;
  kind: ResourceKind;
  name: string;
  description: string;
  provider: string;
  version: string;
  tags: string[];
  availability: ResourceAvailability;
  updatedAt?: string;
  detail: Record<string, unknown>;
}

export interface ResourceDetailViewModel extends ResourceSummaryViewModel {
  purpose: string;
  owner: string;
  sla: string;
  permissionScope: string;
  compatibility: string[];
}

export type AccessRequestStatus =
  | 'APPROVED'
  | 'CANCELLED'
  | 'DRAFT'
  | 'EXPIRED'
  | 'NEEDS_INFO'
  | 'PENDING'
  | 'REJECTED';

export interface AccessRequestDraft {
  purpose: string;
  environment: 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';
  duration: '30_DAYS' | '90_DAYS' | 'ONE_YEAR';
  scope: string;
  sensitivityConfirmed: boolean;
}

export interface AccessRequestViewModel {
  id: string;
  resourceId: string;
  resourceName: string;
  status: AccessRequestStatus;
  reason?: string;
  createdAt?: string;
}

export interface CatalogQuery {
  keyword: string;
  kind: '' | ResourceKind;
  tag: string;
  provider: string;
  availability: '' | ResourceAvailability;
  sort: 'NAME' | 'RELEVANCE' | 'UPDATED';
  page: number;
}

export const DEFAULT_ACCESS_REQUEST_DRAFT: AccessRequestDraft = {
  purpose: '',
  environment: 'DEVELOPMENT',
  duration: '90_DAYS',
  scope: '只读访问',
  sensitivityConfirmed: false,
};

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  keyword: '',
  kind: '',
  tag: '',
  provider: '',
  availability: '',
  sort: 'RELEVANCE',
  page: 1,
};
