/**
 * @nebula-studio/contracts/integration — 订阅域
 */

export enum SubscribeType {
  CDC = 'CDC',
  POLLING = 'POLLING',
  TRIGGER = 'TRIGGER',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface PollingConfig {
  intervalMs: number;
  lastModifiedColumn: string;
  pollingQuery?: null | string;
}

export interface CdcConfig {
  debeziumConnector: string;
  debeziumEnabled?: boolean;
  kafkaTopic?: string;
  snapshotMode: string;
  tables?: string[];
}

export interface SubscriptionConfig {
  cdcConfig?: CdcConfig;
  columns: string[];
  dataSourceId: string;
  eventTypes: string[];
  pollingConfig?: PollingConfig;
  subscribeType: SubscribeType;
  tableName: string;
}

export interface TableSubscription {
  config: SubscriptionConfig;
  createdAt: string;
  dataSourceId: string;
  status: SubscriptionStatus;
  subscribeType: SubscribeType;
  subscriptionId: string;
  tableName: string;
  tenantId: string;
}

export interface SubscriptionEvent {
  id: string;
  payload: unknown;
  timestamp: string;
  type: string;
}

export interface CamelSubscriptionCreateRequest {
  cdcConfig?: Record<string, unknown>;
  columns?: string[];
  dataSourceId: string;
  eventTypes?: string[];
  pollingConfig?: Record<string, unknown>;
  subscribeType: string;
  tableName: string;
}

export interface SubscriptionRequestRecord {
  approvedBy?: string;
  createdAt?: string;
  id: string;
  reason?: string;
  requestedBy?: string;
  requestType: string;
  status: string;
  subscriptionId: string;
  updatedAt?: string;
}

/** Portal / subscription-request API（camel-console） */
export interface SubscriptionAccessRequestRecord {
  createdAt?: string;
  interfaceId: string;
  reason?: string;
  requestConfig?: Record<string, unknown>;
  requestId: string;
  requestType: string;
  status: string;
  tenantId: string;
  updatedAt?: string;
  userId?: string;
}

export interface SubscriptionAccessRequestCreatePayload {
  interfaceId: string;
  reason: string;
  requestConfig?: Record<string, unknown>;
  requestType?: string;
  tenantId: string;
  userId: string;
}
