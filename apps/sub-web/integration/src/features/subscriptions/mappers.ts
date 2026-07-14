import { SubscribeType } from '@/shared/types';
import type {
  PageResponse,
  SubscriptionConfig,
  TableSubscription,
} from '@/shared/types';

import { DEFAULT_POLLING_INTERVAL_MS } from './types';
import type {
  CreateFormDraft,
  StatusVariant,
  SubscriptionFormState,
} from './types';

export function mapSubscriptionList(
  data:
    | PageResponse<TableSubscription>
    | TableSubscription[]
    | { items?: TableSubscription[] },
): TableSubscription[] {
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export function buildCreateConfig(
  form: SubscriptionFormState,
  draft: CreateFormDraft,
): SubscriptionConfig {
  const payload = { ...form } as SubscriptionConfig;

  if (payload.subscribeType === SubscribeType.POLLING) {
    payload.pollingConfig = {
      lastModifiedColumn:
        payload.pollingConfig?.lastModifiedColumn ?? 'updated_at',
      pollingQuery: payload.pollingConfig?.pollingQuery ?? null,
      intervalMs: Math.max(1, draft.pollingIntervalSec) * 1000,
    };
  }

  if (payload.subscribeType === SubscribeType.CDC) {
    const tables = draft.cdcTablesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    payload.cdcConfig = {
      debeziumConnector: 'postgres',
      snapshotMode: payload.cdcConfig?.snapshotMode ?? 'initial',
      debeziumEnabled: draft.cdcEnabled,
      tables: tables.length > 0 ? tables : [payload.tableName ?? ''],
    };
  }

  return payload;
}

export function cdcModeLabel(sub: TableSubscription): string {
  if (sub.subscribeType !== SubscribeType.CDC) return '';
  const enabled = sub.config.cdcConfig?.debeziumEnabled;
  return enabled ? 'Debezium CDC' : '模拟 CDC';
}

export function cdcTablesLabel(sub: TableSubscription): string {
  const tables = sub.config.cdcConfig?.tables;
  if (tables && tables.length > 0) return tables.join(', ');
  return sub.tableName;
}

export function pollingIntervalSec(sub: TableSubscription): number {
  const ms =
    sub.config.pollingConfig?.intervalMs ?? DEFAULT_POLLING_INTERVAL_MS;
  return Math.round(ms / 1000);
}

export function pollingIntervalLabel(sub: TableSubscription): string {
  return `${pollingIntervalSec(sub)} 秒/次`;
}

export function statusVariant(status: string): StatusVariant {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ERROR') return 'danger';
  if (status === 'SUSPENDED') return 'warning';
  return 'default';
}
