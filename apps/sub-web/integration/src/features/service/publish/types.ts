import type { OrchestrationType, SubscriptionMode } from '@/shared/types';

export type ServiceTab = 'all' | 'atomic' | 'composite';

export interface PublishForm {
  subscriptionMode: SubscriptionMode;
  orchestrationType: OrchestrationType;
  flowDefinitionId: string;
  dagDefinitionId: string;
}

export const SERVICE_TAB_LABELS: Record<ServiceTab, string> = {
  all: '全部',
  atomic: '原子',
  composite: '组合',
};

export const SUBSCRIPTION_MODE_OPTIONS = [
  { value: 'OPEN' as const, label: '开放订阅' },
  { value: 'APPROVAL' as const, label: '审批订阅' },
];

export const COMPOSITE_ORCHESTRATION_OPTIONS = [
  { value: 'DAG' as const, label: 'DAG 编排' },
  { value: 'BPMN' as const, label: 'BPMN 流程（兼容）' },
];

export const PUBLISH_ORCHESTRATION_OPTIONS = [
  { value: 'ATOMIC' as const, label: '原子（直连）' },
  { value: 'BPMN' as const, label: 'BPMN 流程' },
  { value: 'DAG' as const, label: 'DAG 编排' },
];
