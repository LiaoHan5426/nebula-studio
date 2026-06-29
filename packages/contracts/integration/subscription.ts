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
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ERROR = 'ERROR',
}

export interface PollingConfig {
  intervalMs: number;
  lastModifiedColumn: string;
  pollingQuery?: string | null;
}

export interface CdcConfig {
  debeziumConnector: string;
  kafkaTopic: string;
  snapshotMode: string;
}

export interface SubscriptionConfig {
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscribeType;
  pollingConfig?: PollingConfig;
  cdcConfig?: CdcConfig;
  columns: string[];
  eventTypes: string[];
}

export interface TableSubscription {
  subscriptionId: string;
  tenantId: string;
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscribeType;
  status: SubscriptionStatus;
  createdAt: string;
  config: SubscriptionConfig;
}

export interface SubscriptionEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: unknown;
}
