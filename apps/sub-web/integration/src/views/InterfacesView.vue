<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { interfaceApi } from '../services/api';
import type { ApiInterface } from '../types';
import { InterfaceType } from '../types';
import BpmnEditor from '@nebula-studio/nebula-flow-editor/components/BpmnEditor.vue';

const interfaces = ref<ApiInterface[]>([]);
const loading = ref(false);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showFlowEditor = ref(false);
const currentInterface = ref<ApiInterface | null>(null);
const bpmnXml = ref<string>('');

const activeTab = ref<'atomic' | 'composite'>('atomic');

onMounted(async () => {
  await loadInterfaces();
});

async function loadInterfaces() {
  loading.value = true;
  try {
    const response = await interfaceApi.list();
    if (response.success) {
      interfaces.value = response.data.items;
    }
  } catch (error) {
    console.error('Failed to load interfaces:', error);
  } finally {
    loading.value = false;
  }
}

const atomicInterfaces = computed(() =>
  interfaces.value.filter((i) => i.interfaceType === 'ATOMIC'),
);

const compositeInterfaces = computed(() =>
  interfaces.value.filter((i) => i.interfaceType === 'COMPOSITE'),
);

async function handleCreate(type: InterfaceType) {
  currentInterface.value = {
    interfaceId: '',
    tenantId: '',
    interfaceName: '',
    interfaceType: type,
    endpointUri: '',
    method: 'GET',
    authConfig: {
      authType: 'NONE',
      allowedTenants: [],
    },
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
  } as any;

  if (type === 'COMPOSITE') {
    bpmnXml.value = '';
    showFlowEditor.value = true;
  } else {
    showCreateDialog.value = true;
  }
}

async function handleEdit(intf: ApiInterface) {
  currentInterface.value = intf;

  if (intf.interfaceType === 'COMPOSITE') {
    const response = await interfaceApi.getXml(intf.interfaceId);
    if (response.success) {
      bpmnXml.value = response.data;
    }
    showFlowEditor.value = true;
  } else {
    showEditDialog.value = true;
  }
}

async function handleSaveFlow() {
  if (!currentInterface.value) return;

  try {
    await interfaceApi.saveXml(
      currentInterface.value.interfaceId,
      bpmnXml.value,
    );
    showFlowEditor.value = false;
    await loadInterfaces();
  } catch (error) {
    console.error('Failed to save flow:', error);
  }
}

async function handleDelete(interfaceId: string) {
  try {
    await interfaceApi.delete(interfaceId);
    await loadInterfaces();
  } catch (error) {
    console.error('Failed to delete interface:', error);
  }
}

async function handleExecute(interfaceId: string) {
  try {
    const response = await interfaceApi.execute(interfaceId, {});
    console.warn(
      'Interface execution result:',
      JSON.stringify(response.data, null, 2),
    );
  } catch (error) {
    console.error('Failed to execute interface:', error);
  }
}

function getMethodColor(method: string) {
  const colors: Record<string, string> = {
    GET: 'hsl(var(--primary))',
    POST: 'hsl(var(--success))',
    PUT: 'hsl(var(--warning))',
    DELETE: 'hsl(var(--destructive))',
    PATCH: 'hsl(var(--accent))',
  };
  return colors[method] || method;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: 'hsl(var(--success))',
    INACTIVE: 'hsl(var(--muted-foreground))',
    DRAFT: 'hsl(var(--warning))',
  };
  return colors[status] || status;
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    ACTIVE: '已启用',
    INACTIVE: '已禁用',
    DRAFT: '草稿',
  };
  return texts[status] || status;
}
</script>

<template>
  <div class="interfaces-view">
    <div class="page-header">
      <h2 class="page-title">接口管理</h2>
      <div class="header-actions">
        <button
          class="btn btn-primary"
          @click="handleCreate(InterfaceType.ATOMIC)"
        >
          新建原子接口
        </button>
        <button
          class="btn btn-primary"
          @click="handleCreate(InterfaceType.COMPOSITE)"
        >
          新建组合接口
        </button>
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'atomic' }"
        @click="activeTab = 'atomic'"
      >
        原子接口 ({{ atomicInterfaces.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'composite' }"
        @click="activeTab = 'composite'"
      >
        组合接口 ({{ compositeInterfaces.length }})
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div
      v-else-if="activeTab === 'atomic' && atomicInterfaces.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔗</div>
      <div class="empty-text">暂无原子接口</div>
    </div>

    <div
      v-else-if="activeTab === 'composite' && compositeInterfaces.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔄</div>
      <div class="empty-text">暂无组合接口</div>
    </div>

    <div v-else class="interfaces-list">
      <div
        v-for="intf in activeTab === 'atomic'
          ? atomicInterfaces
          : compositeInterfaces"
        :key="intf.interfaceId"
        class="interface-card"
      >
        <div class="interface-header">
          <div class="interface-info">
            <h3 class="interface-title">{{ intf.interfaceName }}</h3>
            <p class="interface-endpoint">{{ intf.endpointUri }}</p>
          </div>
          <div class="interface-badges">
            <span
              class="method-badge"
              :style="{ background: getMethodColor(intf.method) }"
            >
              {{ intf.method }}
            </span>
            <span
              class="status-badge"
              :style="{ color: getStatusColor(intf.status) }"
            >
              {{ getStatusText(intf.status) }}
            </span>
          </div>
        </div>

        <div class="interface-details">
          <div class="detail-item">
            <span class="detail-label">认证方式:</span>
            <span class="detail-value">{{ intf.authConfig.authType }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间:</span>
            <span class="detail-value">{{
              new Date(intf.createdAt).toLocaleString()
            }}</span>
          </div>
          <div v-if="intf.interfaceType === 'COMPOSITE'" class="detail-item">
            <span class="detail-label">步骤数:</span>
            <span class="detail-value">{{
              (intf as any).steps?.length || 0
            }}</span>
          </div>
        </div>

        <div class="interface-actions">
          <button class="btn btn-secondary" @click="handleEdit(intf)">
            编辑
          </button>
          <button
            class="btn btn-secondary"
            @click="handleExecute(intf.interfaceId)"
          >
            执行
          </button>
          <button
            class="btn btn-danger"
            @click="handleDelete(intf.interfaceId)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 流程编辑器对话框 -->
    <div
      v-if="showFlowEditor"
      class="modal-overlay"
      @click.self="showFlowEditor = false"
    >
      <div class="modal modal-large">
        <div class="modal-header">
          <h3>流程编辑器 - {{ currentInterface?.interfaceName }}</h3>
          <button class="modal-close" @click="showFlowEditor = false">×</button>
        </div>
        <div class="modal-body modal-body-full">
          <BpmnEditor v-model:xml="bpmnXml" @changed="() => {}" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showFlowEditor = false">
            取消
          </button>
          <button class="btn btn-primary" @click="handleSaveFlow">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interfaces-view {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.header-actions {
  display: flex;
  gap: 8px;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.tab-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: hsl(var(--foreground));
}

.tab-btn.active {
  font-weight: 500;
  color: hsl(var(--primary));
  border-bottom-color: hsl(var(--primary));
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-primary {
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
}

.btn-primary:hover {
  background: hsl(var(--primary) / 80%);
}

.btn-secondary {
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted));
}

.btn-danger {
  color: hsl(var(--destructive-foreground));
  background: hsl(var(--destructive));
}

.btn-danger:hover {
  background: hsl(var(--destructive) / 80%);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: hsl(var(--muted-foreground));
}

.empty-icon {
  margin-bottom: 16px;
  font-size: 48px;
}

.interfaces-list {
  display: grid;
  gap: 16px;
}

.interface-card {
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.interface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.interface-info {
  flex: 1;
}

.interface-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.interface-endpoint {
  font-family: Monaco, Menlo, monospace;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.interface-badges {
  display: flex;
  gap: 8px;
}

.method-badge {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border-radius: 4px;
}

.status-badge {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
}

.interface-details {
  display: grid;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.detail-item {
  display: flex;
  font-size: 13px;
}

.detail-label {
  flex-shrink: 0;
  width: 80px;
  color: hsl(var(--muted-foreground));
}

.detail-value {
  flex: 1;
  color: hsl(var(--foreground));
}

.interface-actions {
  display: flex;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  background: hsl(var(--card));
  border-radius: 8px;
}

.modal-large {
  max-width: 90vw;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
}

.modal-close:hover {
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 16px;
}

.modal-body-full {
  height: calc(90vh - 120px);
  padding: 0;
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
}
</style>
