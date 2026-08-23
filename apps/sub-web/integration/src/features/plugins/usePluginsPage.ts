import type { PluginRecord } from '@/features/plugin/api';

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ConnectorType } from '@/shared/types';
import { useQuery } from '@tanstack/vue-query';

import { pluginListQueryOptions } from './queryOptions';

export interface PluginRow {
  id: string;
  name: string;
  version: string;
  connectorId: string;
  type: string;
  description: string;
  status: string;
  statusLabel: string;
  activatedAt: string;
  transitioning: boolean;
  isActive: boolean;
  isPendingReview: boolean;
  canRequestActivation: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '已激活',
  INACTIVE: '已停用',
  UPLOADED: '已上传',
  INSTALLED: '已安装',
  TESTED: '已测试',
  FAILED: '测试失败',
  PENDING_REVIEW: '待审批',
};

export function usePluginsPage() {
  const route = useRoute();
  const pluginsQuery = useQuery(() => pluginListQueryOptions());
  const showUploadDialog = ref(false);
  const uploadFile = ref<File | null>(null);
  const uploadForm = ref({
    pluginName: '',
    pluginVersion: '1.0.0',
    description: '',
  });

  const defaultPluginInfo = {
    label: '数据库适配插件',
    desc: '适配需要连接的数据库，如 PostgreSQL、MySQL 等',
  };

  const pluginTypeMap: Record<string, { desc: string; label: string }> = {
    database: {
      label: '数据库适配插件',
      desc: '适配需要连接的数据库，如 PostgreSQL、MySQL 等',
    },
    protocol: {
      label: '协议插件',
      desc: '适配需要的连接协议，如 HTTP、TCP 等',
    },
    preprocessor: {
      label: '前置处理器插件',
      desc: '在请求处理前进行预处理，参考 Camel 前置处理器',
    },
    postprocessor: {
      label: '后置处理器插件',
      desc: '在请求处理后进行后置处理，参考 Camel 后置处理器',
    },
    aggregator: {
      label: '聚合插件',
      desc: '聚合多个处理结果，参考 Camel 聚合处理器',
    },
    dispatcher: {
      label: '分发插件',
      desc: '复制分发、条件分发等，参考 Camel 分发处理器',
    },
    transformer: {
      label: '转换插件',
      desc: '转换数据格式，放在处理步骤前为参数转换，放在后为结果转换',
    },
  };

  const pluginType = computed(() => {
    const pathParts = route.path.split('/');
    return pathParts[pathParts.length - 1] || 'database';
  });

  const showConnectorSection = computed(
    () => pluginType.value === 'database' || pluginType.value === 'protocol',
  );

  const connectorSectionType = computed(() =>
    pluginType.value === 'protocol'
      ? ConnectorType.PROTOCOL
      : ConnectorType.DATABASE,
  );

  function resolvePluginCategory(item: PluginRecord): string {
    const fromMeta =
      item.pluginCategory ??
      (typeof item.metadata?.pluginCategory === 'string'
        ? item.metadata.pluginCategory
        : undefined);
    if (typeof fromMeta === 'string' && fromMeta.trim()) {
      return fromMeta.trim().toLowerCase();
    }
    return '';
  }

  const pluginInfo = computed(
    () => pluginTypeMap[pluginType.value] ?? defaultPluginInfo,
  );

  const CONNECTOR_DISPLAY_NAMES: Record<string, string> = {
    'postgresql-connector': 'PostgreSQL 连接器',
    'mysql-connector': 'MySQL 连接器',
    'http-connector': 'HTTP 连接器',
  };

  function resolveDisplayName(item: PluginRecord, connectorId: string): string {
    if (CONNECTOR_DISPLAY_NAMES[connectorId]) {
      return CONNECTOR_DISPLAY_NAMES[connectorId];
    }
    const desc = String(item.description ?? '').toLowerCase();
    if (desc.includes('postgresql')) return 'PostgreSQL 连接器';
    if (desc.includes('mysql')) return 'MySQL 连接器';
    if (desc.includes('http')) return 'HTTP 连接器';
    return item.pluginName || '未知插件';
  }

  function mapPluginRow(item: PluginRecord): PluginRow {
    const status = String(item.status ?? 'UNKNOWN');
    const metadata = item.metadata as undefined | { connectorId?: string };
    const connectorId = String(
      item.connectorId ?? metadata?.connectorId ?? '-',
    );
    return {
      id: item.pluginId,
      name: resolveDisplayName(item, connectorId),
      version: item.pluginVersion || '-',
      connectorId,
      type: resolvePluginCategory(item) || pluginType.value,
      description: String(item.description ?? ''),
      status,
      statusLabel: STATUS_LABELS[status] ?? status,
      activatedAt: item.activatedAt
        ? String(item.activatedAt).replace('T', ' ').slice(0, 19)
        : '-',
      transitioning: Boolean(item.transitioning),
      isActive: status === 'ACTIVE',
      isPendingReview: status === 'PENDING_REVIEW',
      canRequestActivation: ['INACTIVE', 'INSTALLED', 'TESTED'].includes(
        status,
      ),
    };
  }

  const plugins = computed(() => {
    const items = pluginsQuery.data.value ?? [];
    return items
      .filter((item) => resolvePluginCategory(item) === pluginType.value)
      .map(mapPluginRow)
      .toSorted(
        (a, b) =>
          a.name.localeCompare(b.name) || b.version.localeCompare(a.version),
      );
  });
  const loading = computed(() => pluginsQuery.isPending.value);
  const pluginVersionsByConnectorId = computed(() => {
    const map: Record<string, { name: string; version: string }> = {};
    for (const plugin of plugins.value) {
      if (plugin.connectorId && plugin.connectorId !== '-') {
        map[plugin.connectorId] = {
          name: plugin.name,
          version: plugin.version,
        };
      }
    }
    return map;
  });

  async function loadPlugins() {
    await pluginsQuery.refetch();
  }

  return {
    connectorSectionType,
    loadPlugins,
    loading,
    pluginInfo,
    pluginType,
    plugins,
    pluginVersionsByConnectorId,
    showConnectorSection,
    showUploadDialog,
    uploadFile,
    uploadForm,
  };
}
