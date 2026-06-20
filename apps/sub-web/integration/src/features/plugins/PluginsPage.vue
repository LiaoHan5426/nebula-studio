<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { pluginApi } from '@/shared/api/consoleApi';
import type { PluginRecord } from '@/shared/api/consoleApi';
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
</script>

<template>
  <div class="plugin-page">
    <header class="plugin-page__header">
      <div class="plugin-page__title-row">
        <span class="plugin-page__icon">{{ pluginInfo.icon }}</span>
        <h2 class="plugin-page__title">{{ pluginInfo.label }}</h2>
      </div>
      <p class="plugin-page__desc">
        {{ pluginInfo.desc }}
        <template v-if="isPlatformAdmin">
          上传后可安装测试；审批普通用户提交的启用申请。
        </template>
        <template v-else>
          仅管理本人上传的插件；平台内置插件请在下方连接器区域查看与测试。启用前需提交审批。
        </template>
      </p>
    </header>

    <div class="plugin-page__actions">
      <NebulaButton variant="primary" @click="showUploadDialog = true">
        新增插件
      </NebulaButton>
      <NebulaButton variant="secondary" @click="loadPlugins">
        刷新
      </NebulaButton>
    </div>

    <div class="plugin-page__table-wrap">
      <NebulaTable
        :data="plugins"
        :loading="loading"
        :scroll-x="{ enabled: false }"
        row-key="id"
        class="plugin-page__table"
      >
        <NebulaTableColumn
          field="name"
          title="插件名称"
          min-width="120"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="version" title="版本" width="80">
          <template #default="{ row }">
            <span class="version-tag">v{{ row.version }}</span>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn
          field="connectorId"
          title="连接器 ID"
          min-width="120"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="statusLabel" title="状态" width="88">
          <template #default="{ row }">
            <span
              :class="[
                'status-badge',
                row.isActive
                  ? 'active'
                  : row.isPendingReview
                    ? 'pending'
                    : 'inactive',
              ]"
            >
              {{ row.statusLabel }}
              <span v-if="row.transitioning" class="status-badge__hint"
                >过渡中</span
              >
            </span>
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
            <div class="action-btns">
              <NebulaButton
                v-if="row.status === 'UPLOADED'"
                variant="secondary"
                @click="handleInstall(row)"
              >
                安装测试
              </NebulaButton>
              <NebulaButton variant="secondary" @click="handleEdit(row)">
                编辑
              </NebulaButton>
              <NebulaButton
                v-if="isPlatformAdmin && row.isPendingReview"
                variant="secondary"
                @click="handleApprove(row)"
              >
                通过
              </NebulaButton>
              <NebulaButton
                v-if="isPlatformAdmin && row.isPendingReview"
                variant="secondary"
                @click="handleReject(row)"
              >
                驳回
              </NebulaButton>
              <NebulaButton
                v-if="!isPlatformAdmin && row.canRequestActivation"
                variant="secondary"
                @click="handleEnable(row)"
              >
                提交启用
              </NebulaButton>
              <NebulaButton
                v-if="isPlatformAdmin && row.canRequestActivation"
                variant="secondary"
                @click="handleEnable(row)"
              >
                激活
              </NebulaButton>
              <NebulaButton
                v-if="row.isActive"
                variant="secondary"
                @click="handleEnable(row)"
              >
                停用
              </NebulaButton>
              <NebulaButton variant="secondary" @click="handleDelete(row)">
                删除
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div v-if="showUploadDialog" class="upload-dialog">
      <div class="upload-dialog__panel">
        <h3>上传插件 JAR</h3>
        <label class="upload-dialog__field">
          插件名称
          <input v-model="uploadForm.pluginName" type="text" />
        </label>
        <label class="upload-dialog__field">
          版本
          <input v-model="uploadForm.pluginVersion" type="text" />
        </label>
        <label class="upload-dialog__field">
          描述
          <input v-model="uploadForm.description" type="text" />
        </label>
        <label class="upload-dialog__field">
          JAR 文件
          <input type="file" accept=".jar" @change="onFileSelected" />
        </label>
        <div class="upload-dialog__actions">
          <NebulaButton variant="secondary" @click="showUploadDialog = false"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="handleUpload"
            >上传</NebulaButton
          >
        </div>
      </div>
    </div>

    <PluginConnectorSection
      v-if="showConnectorSection"
      :connector-type="connectorSectionType"
      :plugin-versions-by-connector-id="pluginVersionsByConnectorId"
    />
  </div>
</template>

<style scoped>
.plugin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.plugin-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.plugin-page__title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.plugin-page__icon {
  font-size: 20px;
}

.plugin-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.plugin-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.plugin-page__actions {
  display: flex;
  gap: 8px;
}

.plugin-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.plugin-page__table {
  width: 100%;
}

.version-tag {
  display: inline-block;
  padding: 2px 8px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border-radius: 4px;
}

.status-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge.active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.status-badge.inactive {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.status-badge.pending {
  color: hsl(38 92% 40%);
  background: hsl(45 100% 50% / 18%);
}

.status-badge__hint {
  font-size: 11px;
  opacity: 0.85;
}

.action-btns {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 6px;
  align-items: center;
}

.upload-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 40%);
}

.upload-dialog__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(420px, 92vw);
  padding: 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.upload-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.upload-dialog__field input {
  padding: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.upload-dialog__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
