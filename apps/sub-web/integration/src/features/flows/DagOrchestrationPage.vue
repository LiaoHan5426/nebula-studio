<script setup lang="ts">
import type { DagDefinitionRecord } from '@/shared/types';

import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import { computed, ref, watch } from 'vue';

import { useNebulaAssembly } from '@nebula-studio/nebula-assembly';
import { DagEditor } from '@nebula-studio/nebula-dag-editor';
import {
  NebulaButton,
  NebulaDialog,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { loadDagNodeSchemas } from '@/features/flows/loadDagNodeSchemas';
import { dagsQueryOptions } from '@/features/flows/queryOptions';
import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { dagApi } from '@/features/monitor/api';
import { useTenant } from '@/shared/composables/useTenant';
import { InterfaceType, isApiSuccess } from '@/shared/types';
import { useQuery } from '@tanstack/vue-query';

const { currentTenantId } = useTenant();
const { editor: editorHost } = useNebulaAssembly();

const dagsQuery = useQuery(() =>
  dagsQueryOptions(currentTenantId.value || undefined),
);
const interfacesQuery = useQuery(() =>
  interfacesQueryOptions('dag-nodes', { pageSize: 200 }),
);
const dags = computed(() => dagsQuery.data.value ?? []);
const loading = computed(() => dagsQuery.isPending.value);
const actionError = ref<null | string>(null);
const showEditor = ref(false);
const editingDag = ref<DagDefinitionRecord | null>(null);
const dagDefinition = ref<DagDefinition | string>({ nodes: {} });
const nodeSchemas = ref<Record<string, PluginNodeSchema>>({});

watch(
  () => interfacesQuery.data.value?.items,
  async (items) => {
    nodeSchemas.value = await loadDagNodeSchemas(
      (items ?? []).filter(
        (item) => item.interfaceType === InterfaceType.ATOMIC,
      ),
    );
  },
  { immediate: true },
);

const editorTitle = computed(() =>
  editingDag.value ? `编辑 DAG — ${editingDag.value.dagName}` : 'DAG 编排',
);

async function loadDags() {
  try {
    await dagsQuery.refetch();
  } catch (error) {
    actionError.value =
      error instanceof Error ? error.message : '加载 DAG 列表失败';
  }
}

function openDraftEditor(name: string) {
  editingDag.value = {
    id: '',
    dagName: name,
    tenantId: currentTenantId.value || undefined,
    status: 'DRAFT',
    version: 1,
  };
  dagDefinition.value = { nodes: {} };
  editorHost.configure({
    size: { height: 'min(72vh, 720px)', width: '100%' },
    readonly: false,
    save: saveEditor,
  });
  showEditor.value = true;
}

async function handleCreate() {
  actionError.value = null;
  const dagName = `DAG ${new Date().toLocaleString()}`;
  openDraftEditor(dagName);
  try {
    const response = await dagApi.create({
      dagName,
      tenantId: currentTenantId.value || undefined,
      dagDefinition: JSON.stringify({ nodes: {} }),
    });
    if (!isApiSuccess(response) || !response.data?.id) {
      actionError.value = response.error ?? response.message ?? '创建 DAG 失败';
      return;
    }
    editingDag.value = response.data;
    await loadDags();
  } catch (error) {
    actionError.value =
      error instanceof Error ? error.message : '创建 DAG 失败';
  }
}

async function openEditor(dag: DagDefinitionRecord) {
  editingDag.value = dag;
  const detail = await dagApi.get(dag.id);
  if (isApiSuccess(detail) && detail.data?.dagDefinition) {
    dagDefinition.value = detail.data.dagDefinition;
  } else {
    dagDefinition.value = { nodes: {} };
  }
  editorHost.configure({
    size: { height: 'min(72vh, 720px)', width: '100%' },
    readonly: false,
    save: saveEditor,
  });
  showEditor.value = true;
}

async function saveEditor() {
  if (!editingDag.value) return;
  const definition =
    typeof dagDefinition.value === 'string'
      ? dagDefinition.value
      : JSON.stringify(dagDefinition.value);
  try {
    if (!editingDag.value.id) {
      const response = await dagApi.create({
        dagName: editingDag.value.dagName,
        tenantId:
          editingDag.value.tenantId || currentTenantId.value || undefined,
        dagDefinition: definition,
      });
      if (!isApiSuccess(response) || !response.data?.id) {
        actionError.value =
          response.error ?? response.message ?? '保存 DAG 失败';
        return;
      }
      editingDag.value = response.data;
    } else {
      await dagApi.update(editingDag.value.id, { dagDefinition: definition });
    }
    showEditor.value = false;
    await loadDags();
  } catch (error) {
    actionError.value =
      error instanceof Error ? error.message : '保存 DAG 失败';
  }
}

async function handlePublish(dag: DagDefinitionRecord) {
  await dagApi.publish(dag.id);
  await loadDags();
}

async function handleDelete(dag: DagDefinitionRecord) {
  await dagApi.delete(dag.id);
  await loadDags();
}

function statusVariant(status?: string) {
  if (status === 'PUBLISHED') return 'success';
  return 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="DAG 编排"
      description="可视化编排插件节点与原子服务调用，发布后可绑定至组合服务"
    >
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="handleCreate">
          新建 DAG
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadDags">刷新</NebulaButton>
      </div>

      <p v-if="actionError" class="page__error">{{ actionError }}</p>

      <div class="page__table-wrap">
        <NebulaTable
          :data="dags"
          :loading="loading"
          row-key="id"
          :scroll-x="{ enabled: false }"
        >
          <NebulaTableColumn field="dagName" title="名称" min-width="160" />
          <NebulaTableColumn
            field="id"
            title="ID"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="status" title="状态" width="100">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ row.status ?? 'DRAFT' }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="version" title="版本" width="80" />
          <NebulaTableColumn title="操作" width="240">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton variant="outline" @click="openEditor(row)">
                  设计
                </NebulaButton>
                <NebulaButton variant="outline" @click="handlePublish(row)">
                  发布
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
      :open="showEditor"
      :title="editorTitle"
      size="full"
      @update:open="showEditor = $event"
    >
      <div class="modal__content--dag">
        <DagEditor v-model="dagDefinition" :node-schemas="nodeSchemas" />
      </div>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="showEditor = false">
          取消
        </NebulaButton>
        <NebulaButton variant="primary" @click="saveEditor">
          保存
        </NebulaButton>
      </div>
    </NebulaDialog>
  </div>
</template>

<style scoped>
.modal__content--dag {
  height: min(70vh, 640px);
  min-height: 420px;
  overflow: hidden;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
