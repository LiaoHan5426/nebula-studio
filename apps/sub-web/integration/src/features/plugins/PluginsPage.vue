<script setup lang="ts">
import type { PluginRow } from '@/features/plugins/usePluginsPage';

import { computed } from 'vue';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { pluginApi } from '@/features/plugin/api';
import PluginConnectorSection from '@/features/plugins/PluginConnectorSection.vue';
import { usePluginsPage } from '@/features/plugins/usePluginsPage';
import { useAuth } from '@/shared/composables/useAuth';

const {
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
} = usePluginsPage();

const { isPlatformAdmin } = useAuth();

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

    <NebulaDialog
      :open="showUploadDialog"
      title="上传插件 JAR"
      @update:open="showUploadDialog = $event"
    >
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
        <NebulaButton variant="primary" @click="handleUpload">
          上传
        </NebulaButton>
      </div>
    </NebulaDialog>

    <PluginConnectorSection
      v-if="showConnectorSection"
      :connector-type="connectorSectionType"
      :plugin-versions-by-connector-id="pluginVersionsByConnectorId"
    />
  </div>
</template>
