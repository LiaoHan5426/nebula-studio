<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import IntegrationBpmnEditor from '@nebula-studio/nebula-flow-editor/components/IntegrationBpmnEditor.vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { interfaceApi } from '@/shared/api/integration';
import type {
  ApiInterface,
  AtomicInterface,
  CompositeInterface,
} from '@/shared/types';
import {
  AuthType,
  InterfaceMethod,
  InterfaceStatus,
  InterfaceType,
  isApiSuccess,
} from '@/shared/types';

const interfaces = ref<ApiInterface[]>([]);
const atomicInterfaceOptions = computed(() =>
  interfaces.value.filter((i) => i.interfaceType === InterfaceType.ATOMIC),
);
const loading = ref(false);
const activeTab = ref<'atomic' | 'composite'>('atomic');

const showAtomicDialog = ref(false);
const showCompositeDialog = ref(false);
const showFlowEditor = ref(false);
const bpmnXml = ref('');
const editingCompositeId = ref('');
const executeNotice = ref<string | null>(null);

const atomicForm = ref<Partial<AtomicInterface>>({
  interfaceName: '',
  endpointUri: '/demo/endpoint',
  method: InterfaceMethod.GET,
  connectorId: '',
  status: InterfaceStatus.DRAFT,
  authConfig: { authType: AuthType.NONE, allowedTenants: ['*'] },
  requestMapping: {},
  responseMapping: {},
  requestSchema: { type: 'object', fields: {} },
  responseSchema: { type: 'object', fields: {} },
});

const compositeForm = ref<Partial<CompositeInterface>>({
  interfaceName: '',
  endpointUri: '/demo/flow',
  method: InterfaceMethod.POST,
  status: InterfaceStatus.DRAFT,
  authConfig: { authType: AuthType.NONE, allowedTenants: ['*'] },
  steps: [],
  flowExpression: '',
});

const atomicInterfaces = computed(() =>
  interfaces.value.filter(
    (i: ApiInterface) => i.interfaceType === InterfaceType.ATOMIC,
  ),
);

const compositeInterfaces = computed(() =>
  interfaces.value.filter(
    (i: ApiInterface) => i.interfaceType === InterfaceType.COMPOSITE,
  ),
);

const visibleInterfaces = computed(() =>
  activeTab.value === 'atomic'
    ? atomicInterfaces.value
    : compositeInterfaces.value,
);

onMounted(loadInterfaces);

async function loadInterfaces() {
  loading.value = true;
  try {
    const response = await interfaceApi.list({ pageSize: 100 });
    if (isApiSuccess(response)) {
      interfaces.value = response.data.items;
    }
  } finally {
    loading.value = false;
  }
}

function openCreateAtomic() {
  atomicForm.value = {
    interfaceName: '',
    endpointUri: '/orders/query',
    method: InterfaceMethod.GET,
    connectorId: 'http-connector',
    status: InterfaceStatus.DRAFT,
    authConfig: {
      authType: AuthType.API_KEY,
      apiKeyHeader: 'X-API-Key',
      allowedTenants: ['*'],
    },
    requestMapping: {},
    responseMapping: {},
    requestSchema: { type: 'object', fields: {} },
    responseSchema: { type: 'object', fields: {} },
  };
  showAtomicDialog.value = true;
}

function openCreateComposite() {
  compositeForm.value = {
    interfaceName: '',
    endpointUri: '/orders/flow',
    method: InterfaceMethod.POST,
    status: InterfaceStatus.DRAFT,
    authConfig: { authType: AuthType.NONE, allowedTenants: ['*'] },
    steps: [],
    flowExpression: '',
  };
  showCompositeDialog.value = true;
}

function openEditAtomic(intf: ApiInterface) {
  atomicForm.value = { ...(intf as AtomicInterface) };
  showAtomicDialog.value = true;
}

async function saveAtomic() {
  const payload = atomicForm.value;
  const response = payload.interfaceId
    ? await interfaceApi.update(payload.interfaceId, payload)
    : await interfaceApi.create({
        ...payload,
        interfaceType: InterfaceType.ATOMIC,
      });
  if (isApiSuccess(response)) {
    showAtomicDialog.value = false;
    await loadInterfaces();
  }
}

async function saveCompositeMeta() {
  const payload = compositeForm.value;
  const response = payload.interfaceId
    ? await interfaceApi.update(payload.interfaceId, payload)
    : await interfaceApi.create({
        ...payload,
        interfaceType: InterfaceType.COMPOSITE,
      });
  if (isApiSuccess(response)) {
    showCompositeDialog.value = false;
    editingCompositeId.value = response.data.interfaceId;
    const xmlRes = await interfaceApi.getXml(response.data.interfaceId);
    bpmnXml.value = isApiSuccess(xmlRes) ? xmlRes.data : '';
    showFlowEditor.value = true;
    await loadInterfaces();
  }
}

async function openCompositeEditor(intf: ApiInterface) {
  editingCompositeId.value = intf.interfaceId;
  compositeForm.value = { ...(intf as CompositeInterface) };
  const response = await interfaceApi.getXml(intf.interfaceId);
  bpmnXml.value = isApiSuccess(response) ? response.data : '';
  showFlowEditor.value = true;
}

async function saveFlowXml() {
  if (!editingCompositeId.value) return;
  await interfaceApi.saveXml(editingCompositeId.value, bpmnXml.value);
  showFlowEditor.value = false;
  await loadInterfaces();
}

async function handleDelete(id: string) {
  await interfaceApi.delete(id);
  await loadInterfaces();
}

async function handleExecute(id: string) {
  executeNotice.value = null;
  const response = await interfaceApi.execute(id, {});
  if (isApiSuccess(response)) {
    executeNotice.value = JSON.stringify(response.data, null, 2);
  }
}

function statusVariant(status: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'DRAFT') return 'warning';
  return 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="接口管理"
      description="原子接口 CRUD 与组合接口 BPMN 编排"
    >
      <div class="page__toolbar">
        <button
          class="page__tab"
          :class="{ 'page__tab--active': activeTab === 'atomic' }"
          @click="activeTab = 'atomic'"
        >
          原子 ({{ atomicInterfaces.length }})
        </button>
        <button
          class="page__tab"
          :class="{ 'page__tab--active': activeTab === 'composite' }"
          @click="activeTab = 'composite'"
        >
          组合 ({{ compositeInterfaces.length }})
        </button>
        <NebulaButton v-if="activeTab === 'atomic'" @click="openCreateAtomic"
          >新建原子接口</NebulaButton
        >
        <NebulaButton v-else @click="openCreateComposite"
          >新建组合接口</NebulaButton
        >
      </div>
      <pre v-if="executeNotice" class="page__notice">{{ executeNotice }}</pre>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="visibleInterfaces.length === 0" class="page__empty">
        暂无接口
      </div>
      <div v-else class="page__list">
        <article
          v-for="intf in visibleInterfaces"
          :key="intf.interfaceId"
          class="page__card"
        >
          <div class="page__card-head">
            <div>
              <h3>{{ intf.interfaceName }}</h3>
              <p class="page__meta">{{ intf.method }} {{ intf.endpointUri }}</p>
            </div>
            <NebulaTag :variant="statusVariant(intf.status)">{{
              intf.status
            }}</NebulaTag>
          </div>
          <div class="page__actions">
            <NebulaButton
              variant="secondary"
              @click="
                intf.interfaceType === InterfaceType.ATOMIC
                  ? openEditAtomic(intf)
                  : openCompositeEditor(intf)
              "
            >
              编辑
            </NebulaButton>
            <NebulaButton
              variant="secondary"
              @click="handleExecute(intf.interfaceId)"
              >执行</NebulaButton
            >
            <NebulaButton
              variant="secondary"
              @click="handleDelete(intf.interfaceId)"
              >删除</NebulaButton
            >
          </div>
        </article>
      </div>
    </NebulaPane>

    <!-- 原子接口对话框 -->
    <div
      v-if="showAtomicDialog"
      class="modal-overlay"
      @click.self="showAtomicDialog = false"
    >
      <NebulaPane
        :title="atomicForm.interfaceId ? '编辑原子接口' : '新建原子接口'"
        class="modal"
      >
        <label class="field"
          ><span>名称</span><input v-model="atomicForm.interfaceName"
        /></label>
        <label class="field"
          ><span>端点 URI</span><input v-model="atomicForm.endpointUri"
        /></label>
        <label class="field">
          <span>方法</span>
          <select v-model="atomicForm.method" class="field__select">
            <option
              v-for="m in Object.values(InterfaceMethod) as InterfaceMethod[]"
              :key="m"
              :value="m"
            >
              {{ m }}
            </option>
          </select>
        </label>
        <label class="field"
          ><span>连接器 ID</span><input v-model="atomicForm.connectorId"
        /></label>
        <label class="field">
          <span>认证</span>
          <select
            v-model="atomicForm.authConfig!.authType"
            class="field__select"
          >
            <option
              v-for="a in Object.values(AuthType) as AuthType[]"
              :key="a"
              :value="a"
            >
              {{ a }}
            </option>
          </select>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showAtomicDialog = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="saveAtomic">保存</NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <!-- 组合接口元数据对话框 -->
    <div
      v-if="showCompositeDialog"
      class="modal-overlay"
      @click.self="showCompositeDialog = false"
    >
      <NebulaPane
        :title="compositeForm.interfaceId ? '编辑组合接口' : '新建组合接口'"
        class="modal"
      >
        <label class="field"
          ><span>名称</span><input v-model="compositeForm.interfaceName"
        /></label>
        <label class="field"
          ><span>端点 URI</span><input v-model="compositeForm.endpointUri"
        /></label>
        <label class="field">
          <span>方法</span>
          <select v-model="compositeForm.method" class="field__select">
            <option
              v-for="m in Object.values(InterfaceMethod) as InterfaceMethod[]"
              :key="m"
              :value="m"
            >
              {{ m }}
            </option>
          </select>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showCompositeDialog = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="saveCompositeMeta"
            >下一步：设计流程</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>

    <!-- BPMN 编辑器 -->
    <div v-if="showFlowEditor" class="modal-overlay modal-overlay--full">
      <NebulaPane title="组合接口流程设计" class="modal modal--large">
        <div class="bpmn-wrap">
          <IntegrationBpmnEditor
            v-model:xml="bpmnXml"
            :atomic-interfaces="atomicInterfaceOptions"
            @changed="() => {}"
          />
        </div>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showFlowEditor = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="saveFlowXml">保存流程</NebulaButton>
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
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.page__notice {
  padding: 10px 12px;
  margin: 0 0 12px;
  overflow: auto;
  font-size: 12px;
  color: hsl(var(--foreground));
  background: hsl(var(--muted) / 40%);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.page__tab {
  padding: 6px 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.page__tab--active {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.page__empty {
  padding: 40px;
  text-align: center;
  color: hsl(var(--muted-foreground));
}

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
}

.page__card-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  font-family: monospace;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__actions {
  display: flex;
  gap: 8px;
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
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field input,
.field__select {
  padding: 8px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
