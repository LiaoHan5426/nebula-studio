<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IntegrationBpmnEditor from '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue';
import { DagEditor } from '@nebula-studio/nebula-dag-editor';
import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { loadDagNodeSchemas } from '@/features/flows/loadDagNodeSchemas';
import { interfaceApi } from '@/shared/api/integration';
import { approvalApi, dagApi } from '@/shared/api/consoleApi';
import { useAuth } from '@/shared/composables/useAuth';
import type {
  ApiInterface,
  CompositeInterface,
  DagDefinitionRecord,
  OrchestrationType,
  SubscriptionMode,
} from '@/shared/types';
import {
  InterfaceAuthType,
  InterfaceMethod,
  InterfaceStatus,
  InterfaceType,
  isApiSuccess,
} from '@/shared/types';

type ServiceTab = 'all' | 'atomic' | 'composite';

const services = ref<ApiInterface[]>([]);
const loading = ref(false);
const activeTab = ref<ServiceTab>('all');
const { isPlatformAdmin } = useAuth();
const router = useRouter();

const showCompositeDialog = ref(false);
const showFlowEditor = ref(false);
const showDagEditor = ref(false);
const showPublishDialog = ref(false);
const bpmnXml = ref('');
const editingCompositeId = ref('');
const editingDagId = ref('');
const dagDefinition = ref<DagDefinition | string>({ nodes: {} });
const nodeSchemas = ref<Record<string, PluginNodeSchema>>({});
const publishTarget = ref<ApiInterface | null>(null);
const dagOptions = ref<DagDefinitionRecord[]>([]);

const publishForm = ref({
  subscriptionMode: 'OPEN' as SubscriptionMode,
  orchestrationType: 'ATOMIC' as OrchestrationType,
  flowDefinitionId: '',
  dagDefinitionId: '',
});

const compositeForm = ref<Partial<CompositeInterface>>({
  interfaceName: '',
  endpointUri: '/orders/flow',
  method: InterfaceMethod.POST,
  status: InterfaceStatus.DRAFT,
  authConfig: { authType: InterfaceAuthType.NONE, allowedTenants: ['*'] },
  steps: [],
  flowExpression: '',
  orchestrationType: 'DAG',
  subscriptionMode: 'OPEN',
});

const atomicOptions = computed(() =>
  services.value.filter((item) => item.interfaceType === InterfaceType.ATOMIC),
);

const compositeServices = computed(() =>
  services.value.filter(
    (item) => item.interfaceType === InterfaceType.COMPOSITE,
  ),
);

const visibleServices = computed(() => {
  if (activeTab.value === 'atomic') {
    return services.value.filter(
      (item) => item.interfaceType === InterfaceType.ATOMIC,
    );
  }
  if (activeTab.value === 'composite') {
    return services.value.filter(
      (item) => item.interfaceType === InterfaceType.COMPOSITE,
    );
  }
  return services.value;
});

onMounted(loadServices);

async function loadServices() {
  loading.value = true;
  try {
    const response = await interfaceApi.list({ pageSize: 100 });
    if (isApiSuccess(response)) {
      services.value = response.data.items ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function serviceTypeLabel(item: ApiInterface) {
  if (item.interfaceType === InterfaceType.COMPOSITE) return '组合服务';
  return '原子服务';
}

function isPublished(item: ApiInterface) {
  return item.status === InterfaceStatus.ACTIVE;
}

function isPendingReview(item: ApiInterface) {
  return item.status === InterfaceStatus.PENDING_REVIEW;
}

function canSubmitPublish(item: ApiInterface) {
  return (
    item.status === InterfaceStatus.DRAFT ||
    item.status === InterfaceStatus.INACTIVE
  );
}

async function handlePublish(item: ApiInterface) {
  publishTarget.value = item;
  publishForm.value = {
    subscriptionMode: item.subscriptionMode ?? 'OPEN',
    orchestrationType:
      item.orchestrationType ??
      (item.interfaceType === InterfaceType.COMPOSITE ? 'DAG' : 'ATOMIC'),
    flowDefinitionId: item.flowDefinitionId ?? '',
    dagDefinitionId: item.dagDefinitionId ?? '',
  };
  if (publishForm.value.orchestrationType === 'DAG') {
    const response = await dagApi.list(item.tenantId);
    if (isApiSuccess(response)) {
      dagOptions.value = response.data ?? [];
    }
  }
  showPublishDialog.value = true;
}

async function confirmPublish() {
  const item = publishTarget.value;
  if (!item) return;

  const snapshotJson = JSON.stringify({
    interfaceId: item.interfaceId,
    interfaceName: item.interfaceName,
    subscriptionMode: publishForm.value.subscriptionMode,
    orchestrationType: publishForm.value.orchestrationType,
    flowDefinitionId: publishForm.value.flowDefinitionId || null,
    dagDefinitionId: publishForm.value.dagDefinitionId || null,
  });

  if (isPlatformAdmin.value) {
    const payload: Partial<ApiInterface> = {
      status: InterfaceStatus.ACTIVE,
      subscriptionMode: publishForm.value.subscriptionMode,
      orchestrationType: publishForm.value.orchestrationType,
    };
    if (publishForm.value.flowDefinitionId) {
      payload.flowDefinitionId = publishForm.value.flowDefinitionId;
    }
    if (publishForm.value.dagDefinitionId) {
      payload.dagDefinitionId = publishForm.value.dagDefinitionId;
    }
    await interfaceApi.update(item.interfaceId, payload);
  } else {
    await approvalApi.submitRequest({
      resourceId: item.interfaceId,
      resourceType: 'API',
      kind: 'PUBLISH',
      applicantId: localStorage.getItem('user_id') || 'current-user',
      reason: `发布服务: ${item.interfaceName}`,
      payload: {
        environment: 'production',
        snapshotJson,
      },
    });
    router.push('/service/approvals');
  }

  showPublishDialog.value = false;
  publishTarget.value = null;
  await loadServices();
}

async function onPublishOrchestrationChange() {
  if (publishForm.value.orchestrationType !== 'DAG' || !publishTarget.value)
    return;
  const response = await dagApi.list(publishTarget.value.tenantId);
  if (isApiSuccess(response)) {
    dagOptions.value = response.data ?? [];
  }
}

async function handleApprove(item: ApiInterface) {
  await interfaceApi.update(item.interfaceId, {
    status: InterfaceStatus.ACTIVE,
  });
  await loadServices();
}

async function handleReject(item: ApiInterface) {
  await interfaceApi.update(item.interfaceId, {
    status: InterfaceStatus.DRAFT,
  });
  await loadServices();
}

async function handleOffline(item: ApiInterface) {
  await interfaceApi.update(item.interfaceId, {
    status: InterfaceStatus.INACTIVE,
  });
  await loadServices();
}

async function handleDelete(item: ApiInterface) {
  await interfaceApi.delete(item.interfaceId);
  await loadServices();
}

function openCreateComposite() {
  compositeForm.value = {
    interfaceName: '',
    endpointUri: '/orders/flow',
    method: InterfaceMethod.POST,
    status: InterfaceStatus.DRAFT,
    authConfig: { authType: InterfaceAuthType.NONE, allowedTenants: ['*'] },
    steps: [],
    flowExpression: '',
    orchestrationType: 'DAG',
    subscriptionMode: 'OPEN',
  };
  showCompositeDialog.value = true;
}

function isDagComposite(item: ApiInterface) {
  return (
    item.interfaceType === InterfaceType.COMPOSITE &&
    (item.orchestrationType ?? 'DAG') === 'DAG'
  );
}

async function ensureDagForComposite(
  item: ApiInterface,
): Promise<DagDefinitionRecord> {
  if (item.dagDefinitionId) {
    const existing = await dagApi.get(item.dagDefinitionId);
    if (isApiSuccess(existing)) {
      return existing.data;
    }
  }
  const createRes = await dagApi.create({
    dagName: `${item.interfaceName} DAG`,
    tenantId: item.tenantId,
    dagDefinition: JSON.stringify({ nodes: {} }),
  });
  if (!isApiSuccess(createRes)) {
    throw new Error(createRes.error ?? createRes.message ?? '创建 DAG 失败');
  }
  await interfaceApi.update(item.interfaceId, {
    dagDefinitionId: createRes.data.id,
    orchestrationType: 'DAG',
  });
  return createRes.data;
}

async function openDagEditor(item: ApiInterface) {
  editingCompositeId.value = item.interfaceId;
  nodeSchemas.value = await loadDagNodeSchemas(services.value);
  const dag = await ensureDagForComposite(item);
  editingDagId.value = dag.id;
  const detail = await dagApi.get(dag.id);
  if (isApiSuccess(detail) && detail.data?.dagDefinition) {
    dagDefinition.value = detail.data.dagDefinition;
  } else {
    dagDefinition.value = { nodes: {} };
  }
  showDagEditor.value = true;
}

async function saveCompositeMeta() {
  const payload = {
    ...compositeForm.value,
    orchestrationType: compositeForm.value.orchestrationType ?? 'BPMN',
    subscriptionMode: compositeForm.value.subscriptionMode ?? 'OPEN',
  };
  const response = payload.interfaceId
    ? await interfaceApi.update(payload.interfaceId, payload)
    : await interfaceApi.create({
        ...payload,
        interfaceType: InterfaceType.COMPOSITE,
      });
  if (isApiSuccess(response)) {
    showCompositeDialog.value = false;
    editingCompositeId.value = response.data.interfaceId;
    if (payload.orchestrationType === 'DAG') {
      await loadServices();
      const saved = services.value.find(
        (item) => item.interfaceId === response.data.interfaceId,
      );
      if (saved) {
        await openDagEditor(saved);
      }
      return;
    }
    const xmlRes = await interfaceApi.getXml(response.data.interfaceId);
    bpmnXml.value = isApiSuccess(xmlRes) ? xmlRes.data : '';
    showFlowEditor.value = true;
    await loadServices();
  }
}

async function openCompositeEditor(item: ApiInterface) {
  if (isDagComposite(item)) {
    await openDagEditor(item);
    return;
  }
  editingCompositeId.value = item.interfaceId;
  compositeForm.value = { ...(item as CompositeInterface) };
  const response = await interfaceApi.getXml(item.interfaceId);
  bpmnXml.value = isApiSuccess(response) ? response.data : '';
  showFlowEditor.value = true;
}

async function saveDagEditor() {
  if (!editingDagId.value || !editingCompositeId.value) return;
  const definition =
    typeof dagDefinition.value === 'string'
      ? dagDefinition.value
      : JSON.stringify(dagDefinition.value);
  await dagApi.update(editingDagId.value, { dagDefinition: definition });
  await interfaceApi.update(editingCompositeId.value, {
    dagDefinitionId: editingDagId.value,
    orchestrationType: 'DAG',
  });
  showDagEditor.value = false;
  await loadServices();
}

async function saveFlowXml() {
  if (!editingCompositeId.value) return;
  await interfaceApi.saveXml(editingCompositeId.value, bpmnXml.value);
  showFlowEditor.value = false;
  await loadServices();
}

function statusVariant(status: string) {
  if (status === InterfaceStatus.ACTIVE) return 'success';
  if (status === InterfaceStatus.PENDING_REVIEW) return 'warning';
  if (status === InterfaceStatus.DRAFT) return 'default';
  return 'default';
}

function statusLabel(status: string) {
  switch (status) {
    case InterfaceStatus.ACTIVE:
      return '已发布';
    case InterfaceStatus.PENDING_REVIEW:
      return '待审批';
    case InterfaceStatus.INACTIVE:
      return '已下线';
    case InterfaceStatus.DRAFT:
      return '草稿';
    default:
      return status;
  }
}

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}
</script>

<template>
  <div class="service-publish-page">
    <header class="service-publish-page__header">
      <div>
        <h2 class="service-publish-page__title">服务发布</h2>
        <p class="service-publish-page__desc">
          <template v-if="isPlatformAdmin">
            发布或下线已注册服务；审批普通用户提交的发布申请。组合服务使用 DAG
            编排。
          </template>
          <template v-else>
            仅管理本人注册/发布的服务；提交发布需平台管理员审批。
          </template>
        </p>
      </div>
    </header>

    <div class="service-publish-page__toolbar">
      <div class="service-publish-page__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="service-publish-page__tab"
          :class="{ 'service-publish-page__tab--active': activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部 ({{ services.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="service-publish-page__tab"
          :class="{
            'service-publish-page__tab--active': activeTab === 'atomic',
          }"
          @click="activeTab = 'atomic'"
        >
          原子 ({{ atomicOptions.length }})
        </button>
        <button
          type="button"
          role="tab"
          class="service-publish-page__tab"
          :class="{
            'service-publish-page__tab--active': activeTab === 'composite',
          }"
          @click="activeTab = 'composite'"
        >
          组合 ({{ compositeServices.length }})
        </button>
      </div>
      <div class="service-publish-page__actions">
        <NebulaButton variant="primary" @click="openCreateComposite">
          新建组合服务
        </NebulaButton>
        <NebulaButton variant="secondary" @click="loadServices">
          刷新
        </NebulaButton>
      </div>
    </div>

    <div class="service-publish-page__table-wrap">
      <NebulaTable
        :data="visibleServices"
        :loading="loading"
        :scroll-x="{ enabled: false }"
        row-key="interfaceId"
        class="service-publish-page__table"
      >
        <NebulaTableColumn
          field="interfaceName"
          title="服务名称"
          min-width="140"
          show-overflow="tooltip"
        />
        <NebulaTableColumn
          field="endpointUri"
          title="端点"
          min-width="150"
          show-overflow="tooltip"
        />
        <NebulaTableColumn title="类型" width="100">
          <template #default="{ row }">
            {{ serviceTypeLabel(row) }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="编排" width="100">
          <template #default="{ row }">
            {{
              row.orchestrationType ??
              (row.interfaceType === InterfaceType.COMPOSITE ? 'DAG' : 'ATOMIC')
            }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn field="status" title="发布状态" width="100">
          <template #default="{ row }">
            <NebulaTag :variant="statusVariant(row.status)">
              {{ statusLabel(row.status) }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn field="createdAt" title="注册时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="300">
          <template #default="{ row }">
            <div class="action-btns">
              <NebulaButton
                v-if="isPlatformAdmin && isPendingReview(row)"
                variant="secondary"
                @click="handleApprove(row)"
              >
                通过
              </NebulaButton>
              <NebulaButton
                v-if="isPlatformAdmin && isPendingReview(row)"
                variant="secondary"
                @click="handleReject(row)"
              >
                驳回
              </NebulaButton>
              <NebulaButton
                v-if="!isPlatformAdmin && canSubmitPublish(row)"
                variant="secondary"
                @click="handlePublish(row)"
              >
                提交审批
              </NebulaButton>
              <NebulaButton
                v-if="isPlatformAdmin && canSubmitPublish(row)"
                variant="secondary"
                @click="handlePublish(row)"
              >
                发布
              </NebulaButton>
              <NebulaButton
                v-if="isPublished(row)"
                variant="secondary"
                @click="handleOffline(row)"
              >
                下线
              </NebulaButton>
              <NebulaButton
                v-if="row.interfaceType === InterfaceType.COMPOSITE"
                variant="secondary"
                @click="openCompositeEditor(row)"
              >
                {{ isDagComposite(row) ? '设计 DAG' : '设计流程' }}
              </NebulaButton>
              <NebulaButton variant="secondary" @click="handleDelete(row)">
                删除
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div
      v-if="showCompositeDialog"
      class="modal-overlay"
      @click.self="showCompositeDialog = false"
    >
      <NebulaPane
        :title="compositeForm.interfaceId ? '编辑组合服务' : '新建组合服务'"
        class="modal"
      >
        <label class="field">
          <span>服务名称</span>
          <NebulaInput v-model="compositeForm.interfaceName" />
        </label>
        <label class="field">
          <span>端点 URI</span>
          <NebulaInput v-model="compositeForm.endpointUri" />
        </label>
        <label class="field">
          <span>方法</span>
          <NebulaSelect
            v-model="compositeForm.method"
            :options="
              Object.values(InterfaceMethod).map((m) => ({
                value: m,
                label: m,
              }))
            "
          />
        </label>
        <label class="field">
          <span>编排类型</span>
          <NebulaSelect
            v-model="compositeForm.orchestrationType"
            :options="[
              { value: 'DAG', label: 'DAG 编排' },
              { value: 'BPMN', label: 'BPMN 流程（兼容）' },
            ]"
          />
        </label>
        <label class="field">
          <span>订阅模式</span>
          <NebulaSelect
            v-model="compositeForm.subscriptionMode"
            :options="[
              { value: 'OPEN', label: '开放订阅' },
              { value: 'APPROVAL', label: '审批订阅' },
            ]"
          />
        </label>
        <div class="modal__actions">
          <NebulaButton
            variant="secondary"
            @click="showCompositeDialog = false"
          >
            取消
          </NebulaButton>
          <NebulaButton @click="saveCompositeMeta">
            {{
              compositeForm.orchestrationType === 'DAG'
                ? '下一步：设计 DAG'
                : '下一步：设计流程'
            }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div v-if="showDagEditor" class="modal-overlay modal-overlay--full">
      <NebulaPane title="组合服务 DAG 编排" class="modal modal--dag">
        <div class="modal--dag__content">
          <DagEditor v-model="dagDefinition" :node-schemas="nodeSchemas" />
        </div>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDagEditor = false">
            取消
          </NebulaButton>
          <NebulaButton @click="saveDagEditor">保存 DAG</NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div v-if="showFlowEditor" class="modal-overlay modal-overlay--full">
      <NebulaPane title="组合服务流程设计" class="modal modal--large">
        <div class="bpmn-wrap">
          <IntegrationBpmnEditor
            v-model:xml="bpmnXml"
            :atomic-interfaces="atomicOptions"
            @changed="() => {}"
          />
        </div>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showFlowEditor = false">
            取消
          </NebulaButton>
          <NebulaButton @click="saveFlowXml">保存流程</NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div
      v-if="showPublishDialog"
      class="modal-overlay"
      @click.self="showPublishDialog = false"
    >
      <NebulaPane title="发布配置" class="modal">
        <p class="publish-hint">
          配置订阅与编排策略，发布后将同步至执行器集群。
        </p>
        <label class="field">
          <span>订阅模式</span>
          <NebulaSelect
            v-model="publishForm.subscriptionMode"
            :options="[
              { value: 'OPEN', label: '开放订阅' },
              { value: 'APPROVAL', label: '审批订阅' },
            ]"
          />
        </label>
        <label class="field">
          <span>编排类型</span>
          <NebulaSelect
            v-model="publishForm.orchestrationType"
            :options="[
              { value: 'ATOMIC', label: '原子（直连）' },
              { value: 'BPMN', label: 'BPMN 流程' },
              { value: 'DAG', label: 'DAG 编排' },
            ]"
            @change="onPublishOrchestrationChange"
          />
        </label>
        <label v-if="publishForm.orchestrationType === 'BPMN'" class="field">
          <span>流程定义 ID（可选）</span>
          <NebulaInput
            v-model="publishForm.flowDefinitionId"
            placeholder="留空则使用服务内嵌 BPMN"
          />
        </label>
        <label v-if="publishForm.orchestrationType === 'DAG'" class="field">
          <span>绑定 DAG</span>
          <NebulaSelect
            v-model="publishForm.dagDefinitionId"
            :options="[{ id: '', dagName: '请选择' }, ...dagOptions]"
            label-key="dagName"
            value-key="id"
          />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showPublishDialog = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="confirmPublish">确认发布</NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.service-publish-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.service-publish-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-publish-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-publish-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.service-publish-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.service-publish-page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-publish-page__tab {
  padding: 6px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.service-publish-page__tab--active {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.service-publish-page__actions {
  display: flex;
  gap: 8px;
}

.service-publish-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-publish-page__table {
  width: 100%;
}

.action-btns {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
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
  align-items: stretch;
  justify-content: center;
  padding: 16px;
}

.modal {
  width: min(520px, 92vw);
}

.modal--large {
  width: min(96vw, 1200px);
  max-height: 92vh;
  overflow: auto;
}

.bpmn-wrap {
  height: min(70vh, 640px);
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.publish-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
</style>
