<script setup lang="ts">
import { DagEditor } from '@nebula-studio/nebula-dag-editor';
import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';
import { computed, onMounted, ref } from 'vue';

import { loadDagNodeSchemas } from '@/features/flows/loadDagNodeSchemas';
import { dagApi } from '@/shared/api/consoleApi';
import { interfaceApi } from '@/shared/api/integration';
import { useTenant } from '@/shared/composables/useTenant';
import type { DagDefinitionRecord } from '@/shared/types';
import { InterfaceType, isApiSuccess } from '@/shared/types';

const dags = ref<DagDefinitionRecord[]>([]);
const loading = ref(false);
const actionError = ref<string | null>(null);
const showEditor = ref(false);
const editingDag = ref<DagDefinitionRecord | null>(null);
const dagDefinition = ref<DagDefinition | string>({ nodes: {} });
const nodeSchemas = ref<Record<string, PluginNodeSchema>>({});

const { currentTenantId } = useTenant();

const editorTitle = computed(() =>
  editingDag.value ? `编辑 DAG — ${editingDag.value.dagName}` : 'DAG 编排',
);

onMounted(async () => {
  await Promise.all([loadDags(), loadNodeSchemas()]);
});

async function loadNodeSchemas() {
  const response = await interfaceApi.list({ pageSize: 200 });
  const interfaces = isApiSuccess(response) ? (response.data.items ?? []) : [];
  nodeSchemas.value = await loadDagNodeSchemas(
    interfaces.filter((item) => item.interfaceType === InterfaceType.ATOMIC),
  );
}

async function loadDags() {
  loading.value = true;
  try {
    const response = await dagApi.list(currentTenantId.value);
    if (isApiSuccess(response)) {
      dags.value = response.data ?? [];
    }
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  actionError.value = null;
  const response = await dagApi.create({
    dagName: `DAG ${new Date().toLocaleString()}`,
    tenantId: currentTenantId.value || undefined,
    dagDefinition: JSON.stringify({ nodes: {} }),
  });
  if (!isApiSuccess(response)) {
    actionError.value = response.error ?? response.message ?? '创建 DAG 失败';
    return;
  }
  await openEditor(response.data);
  await loadDags();
}

async function openEditor(dag: DagDefinitionRecord) {
  editingDag.value = dag;
  const detail = await dagApi.get(dag.id);
  if (isApiSuccess(detail) && detail.data?.dagDefinition) {
    dagDefinition.value = detail.data.dagDefinition;
  } else {
    dagDefinition.value = { nodes: {} };
  }
  showEditor.value = true;
}

async function saveEditor() {
  if (!editingDag.value) return;
  const definition =
    typeof dagDefinition.value === 'string'
      ? dagDefinition.value
      : JSON.stringify(dagDefinition.value);
  await dagApi.update(editingDag.value.id, { dagDefinition: definition });
  showEditor.value = false;
  await loadDags();
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

    <div v-if="showEditor" class="modal-overlay modal-overlay--full">
      <NebulaPane :title="editorTitle" class="modal modal--dag">
        <div class="modal__content--dag">
          <DagEditor v-model="dagDefinition" :node-schemas="nodeSchemas" />
        </div>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showEditor = false">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="saveEditor"
            >保存</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>
  </div>
</template>
