<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dataSourceApi } from '../services/api';
import type {
  DataSourceConfig,
  DatabaseConfig,
  ProtocolConfig,
} from '../types';

const dataSources = ref<DataSourceConfig[]>([]);
const loading = ref(false);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const currentDataSource = ref<DataSourceConfig | null>(null);

const newDataSource = ref<Partial<DataSourceConfig>>({
  name: '',
  connectorId: '',
  config: {} as DatabaseConfig,
});

onMounted(async () => {
  await loadDataSources();
});

async function loadDataSources() {
  loading.value = true;
  try {
    const response = await dataSourceApi.list();
    if (response.success) {
      dataSources.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load datasources:', error);
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  try {
    const response = await dataSourceApi.create(
      newDataSource.value as DataSourceConfig,
    );
    if (response.success) {
      showCreateDialog.value = false;
      await loadDataSources();
    }
  } catch (error) {
    console.error('Failed to create datasource:', error);
  }
}

async function handleEdit(dataSource: DataSourceConfig) {
  currentDataSource.value = dataSource;
  showEditDialog.value = true;
}

async function handleUpdate() {
  if (!currentDataSource.value) return;

  try {
    await dataSourceApi.update(
      currentDataSource.value.dataSourceId,
      currentDataSource.value,
    );
    showEditDialog.value = false;
    await loadDataSources();
  } catch (error) {
    console.error('Failed to update datasource:', error);
  }
}

async function handleDelete(dataSourceId: string) {
  try {
    await dataSourceApi.delete(dataSourceId);
    await loadDataSources();
  } catch (error) {
    console.error('Failed to delete datasource:', error);
  }
}

async function handleTestConnection(dataSourceId: string) {
  try {
    const response = await dataSourceApi.testConnection(dataSourceId);
    if (response.success) {
      console.warn(
        `Connection test successful! Response time: ${response.data.responseTimeMs}ms`,
      );
    } else {
      console.error(`Connection test failed! ${response.data.message}`);
    }
  } catch (error) {
    console.error('Failed to test connection:', error);
  }
}

function getStatusColor(status: string) {
  return status === 'ACTIVE'
    ? 'hsl(var(--success))'
    : 'hsl(var(--muted-foreground))';
}

function getStatusText(status: string) {
  return status === 'ACTIVE' ? '已启用' : '未启用';
}
</script>

<template>
  <div class="datasources-view">
    <div class="page-header">
      <h2 class="page-title">数据源管理</h2>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        新建数据源
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div v-else-if="dataSources.length === 0" class="empty-state">
      <div class="empty-icon">💾</div>
      <div class="empty-text">暂无数据源，点击上方按钮创建</div>
    </div>

    <div v-else class="datasources-list">
      <div
        v-for="dataSource in dataSources"
        :key="dataSource.dataSourceId"
        class="datasource-card"
      >
        <div class="datasource-header">
          <div class="datasource-info">
            <h3 class="datasource-title">{{ dataSource.name }}</h3>
            <p class="datasource-connector">{{ dataSource.connectorId }}</p>
          </div>
          <div class="datasource-status">
            <span
              class="status-badge"
              :style="{ color: getStatusColor(dataSource.status) }"
            >
              {{ getStatusText(dataSource.status) }}
            </span>
          </div>
        </div>

        <div class="datasource-details">
          <div class="detail-item">
            <span class="detail-label">数据源 ID:</span>
            <span class="detail-value">{{ dataSource.dataSourceId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间:</span>
            <span class="detail-value">{{
              new Date(dataSource.createdAt).toLocaleString()
            }}</span>
          </div>
          <div v-if="'host' in dataSource.config" class="detail-item">
            <span class="detail-label">主机:</span>
            <span class="detail-value">{{
              (dataSource.config as DatabaseConfig).host
            }}</span>
          </div>
          <div v-if="'host' in dataSource.config" class="detail-item">
            <span class="detail-label">端口:</span>
            <span class="detail-value">{{
              (dataSource.config as DatabaseConfig).port
            }}</span>
          </div>
          <div v-if="'host' in dataSource.config" class="detail-item">
            <span class="detail-label">数据库:</span>
            <span class="detail-value">{{
              (dataSource.config as DatabaseConfig).database
            }}</span>
          </div>
          <div v-if="'endpointUri' in dataSource.config" class="detail-item">
            <span class="detail-label">端点:</span>
            <span class="detail-value datasource-url">{{
              (dataSource.config as ProtocolConfig).endpointUri
            }}</span>
          </div>
        </div>

        <div class="datasource-actions">
          <button class="btn btn-secondary" @click="handleEdit(dataSource)">
            编辑
          </button>
          <button
            class="btn btn-secondary"
            @click="handleTestConnection(dataSource.dataSourceId)"
          >
            测试连接
          </button>
          <button
            class="btn btn-danger"
            @click="handleDelete(dataSource.dataSourceId)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 创建数据源对话框 -->
    <div
      v-if="showCreateDialog"
      class="modal-overlay"
      @click.self="showCreateDialog = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>新建数据源</h3>
          <button class="modal-close" @click="showCreateDialog = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">数据源名称</label>
            <input
              v-model="newDataSource.name"
              class="form-input"
              placeholder="输入数据源名称"
            />
          </div>
          <div class="form-group">
            <label class="form-label">连接器</label>
            <select v-model="newDataSource.connectorId" class="form-input">
              <option value="">请选择连接器</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            取消
          </button>
          <button class="btn btn-primary" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>

    <!-- 编辑数据源对话框 -->
    <div
      v-if="showEditDialog && currentDataSource"
      class="modal-overlay"
      @click.self="showEditDialog = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>编辑数据源</h3>
          <button class="modal-close" @click="showEditDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">数据源名称</label>
            <input v-model="currentDataSource.name" class="form-input" />
          </div>
          <div v-if="'host' in currentDataSource.config">
            <div class="form-group">
              <label class="form-label">主机</label>
              <input
                v-model="(currentDataSource.config as DatabaseConfig).host"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">端口</label>
              <input
                v-model.number="
                  (currentDataSource.config as DatabaseConfig).port
                "
                type="number"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">数据库</label>
              <input
                v-model="(currentDataSource.config as DatabaseConfig).database"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">用户名</label>
              <input
                v-model="(currentDataSource.config as DatabaseConfig).username"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">密码</label>
              <input
                v-model="(currentDataSource.config as DatabaseConfig).password"
                type="password"
                class="form-input"
              />
            </div>
          </div>
          <div v-if="'endpointUri' in currentDataSource.config">
            <div class="form-group">
              <label class="form-label">端点 URI</label>
              <input
                v-model="
                  (currentDataSource.config as ProtocolConfig).endpointUri
                "
                class="form-input"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditDialog = false">
            取消
          </button>
          <button class="btn btn-primary" @click="handleUpdate">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.datasources-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.btn-primary:hover {
  background: hsl(var(--primary) / 80%);
}

.btn-secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted));
}

.btn-danger {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
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
  font-size: 48px;
  margin-bottom: 16px;
}

.datasources-list {
  display: grid;
  gap: 16px;
}

.datasource-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
}

.datasource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.datasource-info {
  flex: 1;
}

.datasource-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
}

.datasource-connector {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.status-badge {
  padding: 4px 8px;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.datasource-details {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.detail-item {
  display: flex;
  font-size: 13px;
}

.detail-label {
  color: hsl(var(--muted-foreground));
  width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: hsl(var(--foreground));
  flex: 1;
}

.datasource-url {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
}

.datasource-actions {
  display: flex;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: hsl(var(--card));
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 14px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.form-input:focus {
  outline: none;
  border-color: hsl(var(--primary));
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
}
</style>
