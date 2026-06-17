<script setup lang="ts">
import { onMounted, ref } from 'vue';
import IntegrationBpmnEditor from '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { interfaceApi } from '@/shared/api/integration';
import { flowsApi } from '@/shared/api/flows';
import type { ApiInterface, FlowDefinition } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';
import { useTenant } from '@/shared/composables/useTenant';

const flows = ref<FlowDefinition[]>([]);
const atomicInterfaces = ref<ApiInterface[]>([]);
const loading = ref(false);
const showEditor = ref(false);
const editingFlow = ref<FlowDefinition | null>(null);
const bpmnXml = ref('');

const { currentTenantId } = useTenant();

onMounted(async () => {
  await Promise.all([loadFlows(), loadAtomicInterfaces()]);
});

async function loadAtomicInterfaces() {
  const response = await interfaceApi.list({
    pageSize: 100,
    interfaceType: 'ATOMIC',
    status: 'ACTIVE',
  });
  if (isApiSuccess(response)) {
    atomicInterfaces.value = response.data.items ?? [];
  }
}

async function loadFlows() {
  loading.value = true;
  try {
    const response = await flowsApi.list({
      pageSize: 50,
      tenantId: currentTenantId.value,
    });
    if (isApiSuccess(response)) {
      flows.value = response.data.records ?? [];
    }
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  const response = await flowsApi.create({
    name: `Flow ${Date.now()}`,
    tenantId: currentTenantId.value,
    description: 'Demo flow',
  });
  if (isApiSuccess(response)) {
    await openDesign(response.data);
    await loadFlows();
  }
}

async function openDesign(flow: FlowDefinition) {
  editingFlow.value = flow;
  const response = await flowsApi.getXml(flow.id);
  bpmnXml.value = isApiSuccess(response) ? (response.data ?? '') : '';
  showEditor.value = true;
}

async function saveDesign() {
  if (!editingFlow.value) return;
  await flowsApi.saveXml(editingFlow.value.id, bpmnXml.value);
  showEditor.value = false;
  await loadFlows();
}

async function handlePublish(id: string) {
  await flowsApi.publish(id);
  await loadFlows();
}

async function handleDelete(id: string) {
  await flowsApi.delete(id);
  await loadFlows();
}

function statusVariant(status: string) {
  if (status === 'PUBLISHED' || status === 'ACTIVE') return 'success';
  if (status === 'DRAFT') return 'warning';
  return 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="流程定义"
      description="集成平台流程编排：Service Task 对应原子接口调用，保存后发布生效"
    >
      <div class="page__toolbar">
        <NebulaButton @click="handleCreate">新建流程</NebulaButton>
        <NebulaButton variant="secondary" @click="loadFlows">刷新</NebulaButton>
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <NebulaTable v-else :data="flows" class="page__table">
        <NebulaTableColumn field="name" title="名称" min-width="160" />
        <NebulaTableColumn field="category" title="分类" width="120" />
        <NebulaTableColumn field="tenantId" title="租户" width="120" />
        <NebulaTableColumn field="status" title="状态" width="120">
          <template #default="{ row }">
            <NebulaTag :variant="statusVariant(row.status)">{{
              row.status
            }}</NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="280">
          <template #default="{ row }">
            <div class="page__row-actions">
              <NebulaButton variant="secondary" @click="openDesign(row)"
                >设计</NebulaButton
              >
              <NebulaButton variant="secondary" @click="handlePublish(row.id)"
                >发布</NebulaButton
              >
              <NebulaButton variant="secondary" @click="handleDelete(row.id)"
                >删除</NebulaButton
              >
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </NebulaPane>

    <div
      v-if="showEditor && editingFlow"
      class="modal-overlay modal-overlay--full"
    >
      <NebulaPane
        :title="`设计 - ${editingFlow.name}`"
        class="modal modal--large"
      >
        <div class="bpmn-wrap">
          <IntegrationBpmnEditor
            v-model:xml="bpmnXml"
            :atomic-interfaces="atomicInterfaces"
            @changed="() => {}"
          />
        </div>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showEditor = false"
            >关闭</NebulaButton
          >
          <NebulaButton @click="saveDesign">保存</NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.page__empty {
  padding: 40px;
  text-align: center;
  color: hsl(var(--muted-foreground));
}

.page__table {
  width: 100%;
}

.page__row-actions {
  display: flex;
  gap: 6px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal-overlay--full {
  padding: 16px;
}

.modal--large {
  width: min(96vw, 1200px);
  max-height: 92vh;
  overflow: auto;
}

.bpmn-wrap {
  height: min(72vh, 680px);
  margin-bottom: 12px;
  overflow: hidden;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
