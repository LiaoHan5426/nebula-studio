<script setup lang="ts">
import { computed } from 'vue';
import { NebulaPane } from '@nebula-studio/nebula-ui';

import ServiceCompositeDialog from './components/publish/ServiceCompositeDialog.vue';
import ServiceDagEditorDialog from './components/publish/ServiceDagEditorDialog.vue';
import ServiceFlowEditorDialog from './components/publish/ServiceFlowEditorDialog.vue';
import ServicePublishDialog from './components/publish/ServicePublishDialog.vue';
import ServicePublishTable from './components/publish/ServicePublishTable.vue';
import ServicePublishToolbar from './components/publish/ServicePublishToolbar.vue';
import { useServicePublish } from './composables/useServicePublish';

const {
  services,
  loading,
  activeTab,
  isPlatformAdmin,
  showCompositeDialog,
  showFlowEditor,
  showDagEditor,
  showPublishDialog,
  bpmnXml,
  dagDefinition,
  nodeSchemas,
  publishForm,
  compositeForm,
  dagOptions,
  atomicOptions,
  compositeServices,
  visibleServices,
  loadServices,
  handlePublish,
  confirmPublish,
  onPublishOrchestrationChange,
  handleApprove,
  handleReject,
  handleOffline,
  handleDelete,
  openCreateComposite,
  saveCompositeMeta,
  openCompositeEditor,
  saveDagEditor,
  saveFlowXml,
} = useServicePublish();

const pageDescription = computed(() =>
  isPlatformAdmin.value
    ? '发布或下线已注册服务；审批普通用户提交的发布申请。组合服务使用 DAG 编排。'
    : '仅管理本人注册/发布的服务；提交发布需平台管理员审批。',
);
</script>

<template>
  <div class="page">
    <NebulaPane title="服务发布" :description="pageDescription">
      <ServicePublishToolbar
        v-model:active-tab="activeTab"
        :total-count="services.length"
        :atomic-count="atomicOptions.length"
        :composite-count="compositeServices.length"
        @create-composite="openCreateComposite"
        @refresh="loadServices"
      />

      <div class="page__table-wrap">
        <ServicePublishTable
          :services="visibleServices"
          :loading="loading"
          :is-platform-admin="isPlatformAdmin"
          @approve="handleApprove"
          @reject="handleReject"
          @publish="handlePublish"
          @offline="handleOffline"
          @delete="handleDelete"
          @edit-composite="openCompositeEditor"
        />
      </div>
    </NebulaPane>

    <ServiceCompositeDialog
      :open="showCompositeDialog"
      :form="compositeForm"
      @close="showCompositeDialog = false"
      @submit="saveCompositeMeta"
      @update:form="compositeForm = $event"
    />

    <ServiceDagEditorDialog
      :open="showDagEditor"
      :definition="dagDefinition"
      :node-schemas="nodeSchemas"
      @close="showDagEditor = false"
      @submit="saveDagEditor"
      @update:definition="dagDefinition = $event"
    />

    <ServiceFlowEditorDialog
      :open="showFlowEditor"
      :xml="bpmnXml"
      :atomic-interfaces="atomicOptions"
      @close="showFlowEditor = false"
      @submit="saveFlowXml"
      @update:xml="bpmnXml = $event"
    />

    <ServicePublishDialog
      :open="showPublishDialog"
      :form="publishForm"
      :dag-options="dagOptions"
      @close="showPublishDialog = false"
      @submit="confirmPublish"
      @orchestration-change="onPublishOrchestrationChange"
      @update:form="publishForm = $event"
    />
  </div>
</template>
