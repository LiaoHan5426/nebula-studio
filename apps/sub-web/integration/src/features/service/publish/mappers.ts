import type {
  ApiInterface,
  CompositeInterface,
  OrchestrationType,
} from '@/shared/types';
import {
  InterfaceAuthType,
  InterfaceMethod,
  InterfaceStatus,
  InterfaceType,
} from '@/shared/types';

import type { PublishForm } from './types';

export function createDefaultCompositeForm(): Partial<CompositeInterface> {
  return {
    interfaceName: '',
    endpointUri: '/orders/flow',
    method: InterfaceMethod.POST,
    status: InterfaceStatus.DRAFT,
    authConfig: { authType: InterfaceAuthType.NONE, allowedTenants: ['*'] },
    steps: [],
    flowExpression: '',
    orchestrationType: 'DAG',
    subscriptionMode: 'OPEN',
  };
}

export function buildPublishFormFromItem(item: ApiInterface): PublishForm {
  return {
    subscriptionMode: item.subscriptionMode ?? 'OPEN',
    orchestrationType:
      item.orchestrationType ??
      (item.interfaceType === InterfaceType.COMPOSITE ? 'DAG' : 'ATOMIC'),
    flowDefinitionId: item.flowDefinitionId ?? '',
    dagDefinitionId: item.dagDefinitionId ?? '',
  };
}

export function buildPublishSnapshotJson(
  item: ApiInterface,
  form: PublishForm,
): string {
  return JSON.stringify({
    interfaceId: item.interfaceId,
    interfaceName: item.interfaceName,
    subscriptionMode: form.subscriptionMode,
    orchestrationType: form.orchestrationType,
    flowDefinitionId: form.flowDefinitionId || null,
    dagDefinitionId: form.dagDefinitionId || null,
  });
}

export function serviceTypeLabel(item: ApiInterface): string {
  if (item.interfaceType === InterfaceType.COMPOSITE) return '组合服务';
  return '原子服务';
}

export function isPublished(item: ApiInterface): boolean {
  return item.status === InterfaceStatus.ACTIVE;
}

export function isPendingReview(item: ApiInterface): boolean {
  return item.status === InterfaceStatus.PENDING_REVIEW;
}

export function canSubmitPublish(item: ApiInterface): boolean {
  return (
    item.status === InterfaceStatus.DRAFT ||
    item.status === InterfaceStatus.INACTIVE
  );
}

export function isDagComposite(item: ApiInterface): boolean {
  return (
    item.interfaceType === InterfaceType.COMPOSITE &&
    (item.orchestrationType ?? 'DAG') === 'DAG'
  );
}

export function defaultOrchestrationType(
  item: ApiInterface,
): OrchestrationType {
  return (
    item.orchestrationType ??
    (item.interfaceType === InterfaceType.COMPOSITE ? 'DAG' : 'ATOMIC')
  );
}

export function statusVariant(
  status: string,
): 'success' | 'warning' | 'default' {
  if (status === InterfaceStatus.ACTIVE) return 'success';
  if (status === InterfaceStatus.PENDING_REVIEW) return 'warning';
  return 'default';
}

export function statusLabel(status: string): string {
  switch (status) {
    case InterfaceStatus.ACTIVE:
      return '已发布';
    case InterfaceStatus.PENDING_REVIEW:
      return '待审批';
    case InterfaceStatus.INACTIVE:
      return '已下线';
    case InterfaceStatus.DRAFT:
      return '草稿';
    default:
      return status;
  }
}

export function formatTime(value?: string): string {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}
