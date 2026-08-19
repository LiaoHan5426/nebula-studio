import type { PluginRecord } from '@/features/plugin/api';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { pluginApi } from '@/features/plugin/api';
import { ConnectorType, isApiSuccess } from '@/shared/types';

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
  const plugins = ref<PluginRow[]>([]);
  const loading = ref(false);
  const showUploadDialog = ref(false);
  const uploadFile = ref<File | null>(null);
  const uploadForm = ref({
    pluginName: '',
    pluginVersion: '1.0.0',
    description: '',
  });

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

  function mapPluginRow(item: PluginRecord): PluginRow {
    const status = String(item.status ?? 'UNKNOWN');
    const metadata = item.metadata as undefined | { connectorId?: string };
    const connectorId = String(
      item.connectorId ?? metadata?.connectorId ?? '-',
    );
    return {
      id: item.pluginId,
      name: item.pluginName || '未知插件',
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

  async function loadPlugins() {
    loading.value = true;
    try {
      const response = await pluginApi.list({ pageSize: 100 });
      if (isApiSuccess(response)) {
        const items = response.data.items ?? [];
        plugins.value = items
          .filter((item) => resolvePluginCategory(item) === pluginType.value)
          .map(mapPluginRow)
          .toSorted(
            (a, b) =>
              a.name.localeCompare(b.name) ||
              b.version.localeCompare(a.version),
          );
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    void loadPlugins();
  });

  return {
    connectorSectionType,
    loadPlugins,
    loading,
    pluginType,
    plugins,
    pluginVersionsByConnectorId,
    showConnectorSection,
    showUploadDialog,
    uploadFile,
    uploadForm,
  };
}
