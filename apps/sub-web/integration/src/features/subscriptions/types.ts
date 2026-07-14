import { SubscribeType } from '@/shared/types';
import type { SubscriptionConfig } from '@/shared/types';

export const DEFAULT_POLLING_INTERVAL_MS = 2000;

export const POLLING_INTERVAL_UPDATE_NOTICE =
  '轮询间隔修改需后端 PUT /api/console/subscription/{id} 支持，当前版本请删除后重建订阅';

export type StatusVariant = 'success' | 'danger' | 'warning' | 'default';

export interface SubscriptionFormState extends Partial<SubscriptionConfig> {
  dataSourceId: string;
  tableName: string;
  subscribeType: SubscriptionConfig['subscribeType'];
}

export interface CreateFormDraft {
  pollingIntervalSec: number;
  cdcEnabled: boolean;
  cdcTablesInput: string;
}

export const DEFAULT_SUBSCRIPTION_FORM: SubscriptionFormState = {
  dataSourceId: '',
  tableName: 'demo_orders',
  subscribeType: SubscribeType.POLLING,
  columns: ['*'],
  eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
  pollingConfig: {
    intervalMs: DEFAULT_POLLING_INTERVAL_MS,
    lastModifiedColumn: 'updated_at',
  },
  cdcConfig: {
    debeziumConnector: 'postgres',
    snapshotMode: 'initial',
    debeziumEnabled: false,
    tables: [],
  },
};

export const DEFAULT_CREATE_DRAFT: CreateFormDraft = {
  pollingIntervalSec: 2,
  cdcEnabled: false,
  cdcTablesInput: '',
};
