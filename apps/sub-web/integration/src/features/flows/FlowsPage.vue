<script setup lang="ts">
import type { FlowDefinition } from '@/shared/types';

import { computed, ref } from 'vue';

import { IntegrationBpmnEditor } from '@nebula-studio/nebula-flow-editor';
import {
  NebulaButton,
  NebulaDialog,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { flowsApi } from '@/shared/api/flows';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';
import { useQuery } from '@tanstack/vue-query';

import { flowsQueryOptions } from './queryOptions';

const { currentTenantId } = useTenant();
const flowsQuery = useQuery(() =>
  flowsQueryOptions(currentTenantId.value || undefined),
);
const interfacesQuery = useQuery(() =>
  interfacesQueryOptions('atomic-active', {
    pageSize: 100,
    interfaceType: 'ATOMIC',
    status: 'ACTIVE',
  }),
);
const flows = computed(() => flowsQuery.data.value ?? []);
const atomicInterfaces = computed(
  () => interfacesQuery.data.value?.items ?? [],
);
const loading = computed(() => flowsQuery.isPending.value);
const showEditor = ref(false);
const editingFlow = ref<FlowDefinition | null>(null);
const bpmnXml = ref('');

async function loadFlows() {
  await flowsQuery.refetch();
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
  bpmnXml.value =
    isApiSuccess(response) && typeof response.data === 'string'
      ? response.data
      : '';
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
        <NebulaButton variant="primary" @click="handleCreate">
          新建流程
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadFlows">刷新</NebulaButton>
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else class="page__table-wrap">
        <NebulaTable :data="flows" class="page__table">
          <NebulaTableColumn field="name" title="名称" min-width="160" />
          <NebulaTableColumn field="category" title="分类" width="120" />
          <NebulaTableColumn field="tenantId" title="租户" width="120" />
          <NebulaTableColumn field="status" title="状态" width="120">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ row.status }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="280">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton variant="outline" @click="openDesign(row)">
                  设计
                </NebulaButton>
                <NebulaButton variant="outline" @click="handlePublish(row.id)">
                  发布
                </NebulaButton>
                <NebulaButton variant="outline" @click="handleDelete(row.id)">
                  删除
                </NebulaButton>
              </div>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>

    <NebulaDialog
      :open="showEditor && Boolean(editingFlow)"
      :title="editingFlow ? `设计 - ${editingFlow.name}` : '设计流程'"
      size="full"
      @update:open="showEditor = $event"
    >
      <div class="bpmn-wrap">
        <IntegrationBpmnEditor
          v-model:xml="bpmnXml"
          :atomic-interfaces="atomicInterfaces"
          @changed="() => {}"
        />
      </div>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="showEditor = false">
          关闭
        </NebulaButton>
        <NebulaButton variant="primary" @click="saveDesign">
          保存
        </NebulaButton>
      </div>
    </NebulaDialog>
  </div>
</template>

<style scoped>
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
