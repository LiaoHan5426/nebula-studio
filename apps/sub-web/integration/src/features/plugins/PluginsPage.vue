<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { pluginApi } from '@/features/plugin/api';
import type { PluginRecord } from '@/features/plugin/api';
import PluginConnectorSection from '@/features/plugins/PluginConnectorSection.vue';
import { useAuth } from '@/shared/composables/useAuth';
import { ConnectorType, isApiSuccess } from '@/shared/types';

const route = useRoute();

const defaultPluginInfo = {
  label: '数据库适配插件',
  icon: '🗄️',
  desc: '适配需要连接的数据库，如 PostgreSQL、MySQL 等',
};

const pluginTypeMap: Record<
  string,
  { label: string; icon: string; desc: string }
> = {
  database: {
    label: '数据库适配插件',
    icon: '🗄️',
    desc: '适配需要连接的数据库，如 PostgreSQL、MySQL 等',
  },
  protocol: {
    label: '协议插件',
    icon: '🔗',
    desc: '适配需要的连接协议，如 HTTP、TCP 等',
  },
  preprocessor: {
    label: '前置处理器插件',
    icon: '⚡',
    desc: '在请求处理前进行预处理，参考 Camel 前置处理器',
  },
  postprocessor: {
    label: '后置处理器插件',
    icon: '🔄',
    desc: '在请求处理后进行后置处理，参考 Camel 后置处理器',
  },
  aggregator: {
    label: '聚合插件',
    icon: '📦',
    desc: '聚合多个处理结果，参考 Camel 聚合处理器',
  },
  dispatcher: {
    label: '分发插件',
    icon: '📤',
    desc: '复制分发、条件分发等，参考 Camel 分发处理器',
  },
  transformer: {
    label: '转换插件',
    icon: '🔀',
    desc: '转换数据格式，放在处理步骤前为参数转换，放在后为结果转换',
  },
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '已激活',
  INACTIVE: '已停用',
  UPLOADED: '已上传',
  INSTALLED: '已安装',
  TESTED: '已测试',
  FAILED: '测试失败',
  PENDING_REVIEW: '待审批',
};

interface PluginRow {
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

const pluginType = computed(() => {
  const pathParts = route.path.split('/');
  return pathParts[pathParts.length - 1] || 'database';
});

const pluginInfo = computed(
  () => pluginTypeMap[pluginType.value] ?? defaultPluginInfo,
);

const showConnectorSection = computed(
  () => pluginType.value === 'database' || pluginType.value === 'protocol',
);

const connectorSectionType = computed(() =>
  pluginType.value === 'protocol'
    ? ConnectorType.PROTOCOL
    : ConnectorType.DATABASE,
);

const plugins = ref<PluginRow[]>([]);
const loading = ref(false);
const showUploadDialog = ref(false);
const uploadFile = ref<File | null>(null);
const uploadForm = ref({
  pluginName: '',
  pluginVersion: '1.0.0',
  description: '',
});
const { isPlatformAdmin } = useAuth();

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

onMounted(() => {
  void loadPlugins();
});

function resolvePluginCategory(item: PluginRecord): string {
  const fromMeta =
    item.pluginCategory ??
    (item.metadata as { pluginCategory?: string } | undefined)?.pluginCategory;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim().toLowerCase();
  }
  return '';
}

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
  return String(item.pluginName ?? item.name ?? '未知插件');
}

function mapPluginRow(item: PluginRecord): PluginRow {
  const status = String(item.status ?? 'UNKNOWN');
  const metadata = item.metadata as { connectorId?: string } | undefined;
  const connectorId = String(item.connectorId ?? metadata?.connectorId ?? '-');
  return {
    id: String(item.pluginId ?? item.id ?? ''),
    name: resolveDisplayName(item, connectorId),
    version: String(item.pluginVersion ?? item.version ?? '-'),
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
    canRequestActivation: ['INSTALLED', 'TESTED', 'INACTIVE'].includes(status),
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
            a.name.localeCompare(b.name) || b.version.localeCompare(a.version),
        );
    }
  } finally {
    loading.value = false;
  }
}

async function handleEnable(plugin: PluginRow) {
  if (plugin.isActive) {
    await pluginApi.deactivate(plugin.id);
    await loadPlugins();
    return;
  }
  await pluginApi.activate(plugin.id);
  await loadPlugins();
}

async function handleApprove(plugin: PluginRow) {
  await pluginApi.activate(plugin.id);
  await loadPlugins();
}

async function handleReject(plugin: PluginRow) {
  await pluginApi.rejectActivation(plugin.id);
  await loadPlugins();
}

async function handleInstall(plugin: PluginRow) {
  await pluginApi.install(plugin.id);
  await pluginApi.test(plugin.id);
  await loadPlugins();
}

async function handleUpload() {
  if (!uploadFile.value || !uploadForm.value.pluginName.trim()) return;
  const form = new FormData();
  form.append('file', uploadFile.value);
  form.append('pluginName', uploadForm.value.pluginName.trim());
  form.append(
    'pluginVersion',
    uploadForm.value.pluginVersion.trim() || '1.0.0',
  );
  form.append('pluginCategory', pluginType.value);
  if (uploadForm.value.description) {
    form.append('description', uploadForm.value.description);
  }
  await pluginApi.uploadJar(form);
  showUploadDialog.value = false;
  uploadFile.value = null;
  uploadForm.value = {
    pluginName: '',
    pluginVersion: '1.0.0',
    description: '',
  };
  await loadPlugins();
}

async function handleDelete(plugin: PluginRow) {
  await pluginApi.uninstall(plugin.id);
  await loadPlugins();
}

function handleEdit(plugin: PluginRow) {
  void plugin;
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  uploadFile.value = input.files?.[0] ?? null;
}

function statusVariant(row: PluginRow) {
  if (row.isActive) return 'success';
  if (row.isPendingReview) return 'warning';
  return 'default';
}

const pluginDescription = computed(() => {
  const base = pluginInfo.value.desc;
  if (isPlatformAdmin.value) {
    return `${base}上传后可安装测试；审批普通用户提交的启用申请。`;
  }
  return `${base}仅管理本人上传的插件；平台内置插件请在下方连接器区域查看与测试。启用前需提交审批。`;
});
</script>

<template>
  <div class="page">
    <NebulaPane :title="pluginInfo.label" :description="pluginDescription">
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="showUploadDialog = true">
          新增插件
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadPlugins">
          刷新
        </NebulaButton>
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="plugins"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="id"
        >
          <NebulaTableColumn
            field="name"
            title="插件名称"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="version" title="版本" width="96">
            <template #default="{ row }">
              <NebulaTag variant="info">v{{ row.version }}</NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn
            field="connectorId"
            title="连接器 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="statusLabel" title="状态" width="112">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row)">
                {{ row.statusLabel }}
                <template v-if="row.transitioning"> · 过渡中</template>
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn
            field="activatedAt"
            title="激活时间"
            width="148"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="description"
            title="描述"
            show-overflow="tooltip"
          />
          <NebulaTableColumn title="操作" width="280">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton
                  v-if="row.status === 'UPLOADED'"
                  variant="outline"
                  @click="handleInstall(row)"
                >
                  安装测试
                </NebulaButton>
                <NebulaButton variant="outline" @click="handleEdit(row)">
                  编辑
                </NebulaButton>
                <NebulaButton
                  v-if="isPlatformAdmin && row.isPendingReview"
                  variant="outline"
                  @click="handleApprove(row)"
                >
                  通过
                </NebulaButton>
                <NebulaButton
                  v-if="isPlatformAdmin && row.isPendingReview"
                  variant="outline"
                  @click="handleReject(row)"
                >
                  驳回
                </NebulaButton>
                <NebulaButton
                  v-if="!isPlatformAdmin && row.canRequestActivation"
                  variant="outline"
                  @click="handleEnable(row)"
                >
                  提交启用
                </NebulaButton>
                <NebulaButton
                  v-if="isPlatformAdmin && row.canRequestActivation"
                  variant="outline"
                  @click="handleEnable(row)"
                >
                  激活
                </NebulaButton>
                <NebulaButton
                  v-if="row.isActive"
                  variant="outline"
                  @click="handleEnable(row)"
                >
                  停用
                </NebulaButton>
                <NebulaButton variant="outline" @click="handleDelete(row)">
                  删除
                </NebulaButton>
              </div>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>

    <div
      v-if="showUploadDialog"
      class="modal-overlay"
      @click.self="showUploadDialog = false"
    >
      <NebulaPane title="上传插件 JAR" class="modal">
        <label class="field">
          <span>插件名称</span>
          <NebulaInput v-model="uploadForm.pluginName" />
        </label>
        <label class="field">
          <span>版本</span>
          <NebulaInput v-model="uploadForm.pluginVersion" />
        </label>
        <label class="field">
          <span>描述</span>
          <NebulaInput v-model="uploadForm.description" />
        </label>
        <label class="field">
          <span>JAR 文件</span>
          <input type="file" accept=".jar" @change="onFileSelected" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showUploadDialog = false">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="handleUpload"
            >上传</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>

    <PluginConnectorSection
      v-if="showConnectorSection"
      :connector-type="connectorSectionType"
      :plugin-versions-by-connector-id="pluginVersionsByConnectorId"
    />
  </div>
</template>
