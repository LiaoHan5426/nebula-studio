<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { connectorApi } from '../services/api';
import type { Connector, DatabaseConfig, ProtocolConfig } from '../types';
import { ConnectorType } from '../types';

const connectors = ref<Connector[]>([]);
const loading = ref(false);
const showTestDialog = ref(false);
const currentConnector = ref<Connector | null>(null);

const activeTab = ref<ConnectorType>(ConnectorType.DATABASE);

const testConfig = ref<DatabaseConfig | ProtocolConfig>({
  host: '',
  port: 3306,
  database: '',
  username: '',
  password: '',
  driverClassName: '',
} as DatabaseConfig);

const testResult = ref<any>(null);
const testing = ref(false);

onMounted(async () => {
  await loadConnectors();
});

async function loadConnectors() {
  loading.value = true;
  try {
    const response = await connectorApi.list();
    if (response.success) {
      connectors.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load connectors:', error);
  } finally {
    loading.value = false;
  }
}

const databaseConnectors = computed(() =>
  connectors.value.filter((c) => c.connectorType === 'DATABASE'),
);

const protocolConnectors = computed(() =>
  connectors.value.filter((c) => c.connectorType === 'PROTOCOL'),
);

async function handleTest(connector: Connector) {
  currentConnector.value = connector;
  testResult.value = null;

  if (connector.connectorType === 'DATABASE') {
    testConfig.value = {
      host: 'localhost',
      port: 3306,
      database: 'test',
      username: 'root',
      password: '',
      driverClassName: '',
    } as DatabaseConfig;
  } else {
    testConfig.value = {
      endpointUri: '',
      parameters: {},
    } as ProtocolConfig;
  }

  showTestDialog.value = true;
}

async function runTest() {
  if (!currentConnector.value) return;

  testing.value = true;
  try {
    let response;
    if (currentConnector.value.connectorType === 'DATABASE') {
      response = await connectorApi.validateDatabase(
        currentConnector.value.connectorId,
        testConfig.value as DatabaseConfig,
      );
    } else {
      response = await connectorApi.validateProtocol(
        currentConnector.value.connectorId,
        testConfig.value as ProtocolConfig,
      );
    }

    if (response.success) {
      testResult.value = response.data;
    }
  } catch (error) {
    console.error('Test failed:', error);
    testResult.value = {
      success: false,
      message: '测试失败',
      responseTimeMs: 0,
    };
  } finally {
    testing.value = false;
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
  <div class="connectors-view">
    <div class="page-header">
      <h2 class="page-title">连接器管理</h2>
    </div>

    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === ConnectorType.DATABASE }"
        @click="activeTab = ConnectorType.DATABASE"
      >
        数据库连接器 ({{ databaseConnectors.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === ConnectorType.PROTOCOL }"
        @click="activeTab = ConnectorType.PROTOCOL"
      >
        协议连接器 ({{ protocolConnectors.length }})
      </button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <div
      v-else-if="activeTab === 'DATABASE' && databaseConnectors.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔌</div>
      <div class="empty-text">暂无数据库连接器</div>
    </div>

    <div
      v-else-if="activeTab === 'PROTOCOL' && protocolConnectors.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔗</div>
      <div class="empty-text">暂无协议连接器</div>
    </div>

    <div v-else class="connectors-list">
      <div
        v-for="connector in activeTab === 'DATABASE'
          ? databaseConnectors
          : protocolConnectors"
        :key="connector.connectorId"
        class="connector-card"
      >
        <div class="connector-header">
          <div class="connector-info">
            <h3 class="connector-title">{{ connector.connectorId }}</h3>
            <p class="connector-type">
              {{
                connector.connectorType === 'DATABASE'
                  ? connector.databaseType
                  : connector.protocolType
              }}
            </p>
          </div>
          <div class="connector-status">
            <span
              class="status-badge"
              :style="{ color: getStatusColor(connector.status) }"
            >
              {{ getStatusText(connector.status) }}
            </span>
          </div>
        </div>

        <div class="connector-details">
          <div class="detail-item">
            <span class="detail-label">连接器类型:</span>
            <span class="detail-value">{{ connector.connectorType }}</span>
          </div>
          <div
            v-if="connector.connectorType === 'DATABASE'"
            class="detail-item"
          >
            <span class="detail-label">JDBC 模板:</span>
            <span class="detail-value connector-url">{{
              connector.jdbcUrlTemplate
            }}</span>
          </div>
        </div>

        <div class="connector-actions">
          <button class="btn btn-primary" @click="handleTest(connector)">
            测试连接
          </button>
        </div>
      </div>
    </div>

    <!-- 测试连接对话框 -->
    <div
      v-if="showTestDialog"
      class="modal-overlay"
      @click.self="showTestDialog = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>测试连接 - {{ currentConnector?.connectorId }}</h3>
          <button class="modal-close" @click="showTestDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div
            v-if="currentConnector?.connectorType === 'DATABASE'"
            class="form-group"
          >
            <label class="form-label">主机</label>
            <input
              v-model="(testConfig as DatabaseConfig).host"
              class="form-input"
            />
          </div>
          <div
            v-if="currentConnector?.connectorType === 'DATABASE'"
            class="form-group"
          >
            <label class="form-label">端口</label>
            <input
              v-model.number="(testConfig as DatabaseConfig).port"
              type="number"
              class="form-input"
            />
          </div>
          <div
            v-if="currentConnector?.connectorType === 'DATABASE'"
            class="form-group"
          >
            <label class="form-label">数据库</label>
            <input
              v-model="(testConfig as DatabaseConfig).database"
              class="form-input"
            />
          </div>
          <div
            v-if="currentConnector?.connectorType === 'DATABASE'"
            class="form-group"
          >
            <label class="form-label">用户名</label>
            <input
              v-model="(testConfig as DatabaseConfig).username"
              class="form-input"
            />
          </div>
          <div
            v-if="currentConnector?.connectorType === 'DATABASE'"
            class="form-group"
          >
            <label class="form-label">密码</label>
            <input
              v-model="(testConfig as DatabaseConfig).password"
              type="password"
              class="form-input"
            />
          </div>
          <div
            v-if="currentConnector?.connectorType === 'PROTOCOL'"
            class="form-group"
          >
            <label class="form-label">端点 URI</label>
            <input
              v-model="(testConfig as ProtocolConfig).endpointUri"
              class="form-input"
            />
          </div>

          <div v-if="testResult" class="test-result">
            <div
              class="result-status"
              :class="{
                success: testResult.success,
                error: !testResult.success,
              }"
            >
              {{ testResult.success ? '✓ 连接成功' : '✗ 连接失败' }}
            </div>
            <div class="result-message">{{ testResult.message }}</div>
            <div class="result-time">
              响应时间: {{ testResult.responseTimeMs }}ms
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showTestDialog = false">
            关闭
          </button>
          <button class="btn btn-primary" @click="runTest" :disabled="testing">
            {{ testing ? '测试中...' : '测试' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connectors-view {
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

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
}

.btn-secondary:hover {
  background: hsl(var(--muted));
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

.connectors-list {
  display: grid;
  gap: 16px;
}

.connector-card {
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.connector-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.connector-info {
  flex: 1;
}

.connector-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.connector-type {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.status-badge {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
}

.connector-details {
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

.connector-url {
  font-family: Monaco, Menlo, monospace;
  font-size: 11px;
}

.connector-actions {
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

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.form-input:focus {
  outline: none;
  border-color: hsl(var(--primary));
}

.test-result {
  padding: 12px;
  margin-top: 16px;
  background: hsl(var(--muted) / 40%);
  border-radius: 6px;
}

.result-status {
  margin-bottom: 8px;
  font-weight: 600;
}

.result-status.success {
  color: hsl(var(--success));
}

.result-status.error {
  color: hsl(var(--destructive));
}

.result-message {
  margin-bottom: 4px;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.result-time {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
}
</style>
