import type {
  ExactComponentLock,
  LowCodeDraftDocument,
  LowCodeNode,
} from '@nebula-studio/low-code-contract';

import { LOW_CODE_SCHEMA_VERSION } from '@nebula-studio/low-code-contract';

export const COMPONENT_API_VERSION = 'low-code.component-api.v1';

export interface LowCodeComponentManifest {
  group: 'business' | 'primitive';
  label: string;
  type: string;
  version: string;
}

export interface LowCodeConnectorManifest {
  credentialRef: string;
  id: string;
  kind: 'http' | 'sse';
  label: string;
  operation: string;
}

export interface LowCodeDataSourceDescriptor {
  id: string;
  kind: 'metric' | 'query';
  label: string;
  path: string;
}

export interface LowCodeTemplateManifest {
  id: string;
  label: string;
  tree: LowCodeNode;
}

export const TRUSTED_COMPONENT_LOCK: ExactComponentLock = {
  components: {
    AlertList: '1.0.0',
    Box: '1.0.0',
    FilterBar: '1.0.0',
    MapControl: '1.0.0',
    MetricCard: '1.0.0',
    RankList: '1.0.0',
    StatusCard: '1.0.0',
    Text: '1.0.0',
    TrendChart: '1.0.0',
  },
};

export const COMPONENT_MANIFESTS: LowCodeComponentManifest[] = [
  { type: 'Text', label: '文本', group: 'primitive', version: '1.0.0' },
  { type: 'Box', label: '容器', group: 'primitive', version: '1.0.0' },
  { type: 'MetricCard', label: '指标卡', group: 'business', version: '1.0.0' },
  { type: 'StatusCard', label: '状态卡', group: 'business', version: '1.0.0' },
  { type: 'AlertList', label: '告警列表', group: 'business', version: '1.0.0' },
  { type: 'TrendChart', label: '趋势图', group: 'business', version: '1.0.0' },
  { type: 'RankList', label: '排行图', group: 'business', version: '1.0.0' },
  { type: 'FilterBar', label: '筛选区', group: 'business', version: '1.0.0' },
  {
    type: 'MapControl',
    label: '地图控制',
    group: 'business',
    version: '1.0.0',
  },
];

export const CONNECTOR_MANIFESTS: LowCodeConnectorManifest[] = [
  {
    id: 'metrics-http',
    label: '指标 HTTP',
    kind: 'http',
    operation: 'GET /api/low-code/runtime/demo-board/versions/1',
    credentialRef: 'cred.metrics',
  },
  {
    id: 'alerts-sse',
    label: '告警 SSE',
    kind: 'sse',
    operation: 'GET /api/monitor/events',
    credentialRef: 'cred.alerts',
  },
];

export const DEFAULT_DATA_SOURCES: LowCodeDataSourceDescriptor[] = [
  { id: 'metrics', label: '订单指标', kind: 'metric', path: 'metrics' },
  { id: 'alerts', label: '告警列表', kind: 'query', path: 'alerts' },
  { id: 'ranks', label: '区域排行', kind: 'query', path: 'ranks' },
  { id: 'series', label: '趋势序列', kind: 'query', path: 'series' },
];

export function createPaletteNode(type: string): LowCodeNode {
  const id = `${type.toLowerCase()}-${String(Date.now())}`;
  const version = '1.0.0';
  switch (type) {
    case 'AlertList':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { items: { kind: 'path', path: 'alerts' } },
      };
    case 'Box':
      return {
        id,
        type,
        componentVersion: version,
        props: { padding: '8px' },
        children: [],
      };
    case 'FilterBar':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { query: { kind: 'path', path: 'filter' } },
      };
    case 'MapControl':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { region: { kind: 'path', path: 'region' } },
      };
    case 'MetricCard':
      return {
        id,
        type,
        componentVersion: version,
        props: { label: '指标' },
        bindings: { value: { kind: 'expr', expression: 'metrics.orders' } },
      };
    case 'RankList':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { items: { kind: 'path', path: 'ranks' } },
      };
    case 'StatusCard':
      return {
        id,
        type,
        componentVersion: version,
        props: { label: '状态' },
        bindings: { status: { kind: 'path', path: 'status' } },
      };
    case 'Text':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { text: { kind: 'literal', value: '文本' } },
      };
    case 'TrendChart':
      return {
        id,
        type,
        componentVersion: version,
        bindings: { values: { kind: 'path', path: 'series' } },
      };
    default:
      throw new Error(`unsupported palette type ${type}`);
  }
}

const MONITORING_TREE: LowCodeNode = {
  id: 'root',
  type: 'Box',
  componentVersion: '1.0.0',
  props: { padding: '16px' },
  children: [
    {
      id: 'title',
      type: 'Text',
      componentVersion: '1.0.0',
      bindings: { text: { kind: 'path', path: 'title' } },
    },
    {
      id: 'filters',
      type: 'FilterBar',
      componentVersion: '1.0.0',
      bindings: { query: { kind: 'path', path: 'filter' } },
    },
    {
      id: 'status',
      type: 'StatusCard',
      componentVersion: '1.0.0',
      props: { label: '集群' },
      bindings: { status: { kind: 'path', path: 'status' } },
    },
    {
      id: 'trend',
      type: 'TrendChart',
      componentVersion: '1.0.0',
      bindings: { values: { kind: 'path', path: 'series' } },
    },
    {
      id: 'rank',
      type: 'RankList',
      componentVersion: '1.0.0',
      bindings: { items: { kind: 'path', path: 'ranks' } },
    },
    {
      id: 'alerts',
      type: 'AlertList',
      componentVersion: '1.0.0',
      bindings: { items: { kind: 'path', path: 'alerts' } },
    },
    {
      id: 'map',
      type: 'MapControl',
      componentVersion: '1.0.0',
      bindings: { region: { kind: 'path', path: 'region' } },
    },
  ],
};

export const TEMPLATE_MANIFESTS: LowCodeTemplateManifest[] = [
  {
    id: 'ops-board',
    label: '运营大屏',
    tree: {
      id: 'root',
      type: 'Box',
      componentVersion: '1.0.0',
      props: { padding: '12px' },
      children: [
        {
          id: 'title',
          type: 'Text',
          componentVersion: '1.0.0',
          bindings: { text: { kind: 'path', path: 'title' } },
        },
        {
          id: 'orders',
          type: 'MetricCard',
          componentVersion: '1.0.0',
          props: { label: '订单' },
          bindings: {
            value: { kind: 'expr', expression: 'metrics.orders + 1' },
          },
        },
      ],
    },
  },
  { id: 'monitoring-center', label: '监控中心', tree: MONITORING_TREE },
];

export function applyTemplate(
  document: LowCodeDraftDocument,
  templateId: string,
): LowCodeDraftDocument {
  const template = TEMPLATE_MANIFESTS.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`unknown template ${templateId}`);
  }
  return {
    ...document,
    schemaVersion: LOW_CODE_SCHEMA_VERSION,
    tree: JSON.parse(JSON.stringify(template.tree)) as LowCodeNode,
  };
}

export const DESIGNER_PREVIEW_DATA: Record<string, unknown> = {
  title: '运营大屏（草稿）',
  metrics: { orders: 41 },
  alerts: ['磁盘 92%', '网关延迟升高'],
  ranks: [
    { label: '华北', value: 18 },
    { label: '华东', value: 12 },
  ],
  status: '正常',
  filter: 'prod',
  region: 'east-china',
  series: [3, 5, 8, 4, 9],
};
