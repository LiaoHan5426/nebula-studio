<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { connectorApi } from '@/shared/api/integration';
import type { Connector, DatabaseConfig, ProtocolConfig } from '@/shared/types';
import { ConnectorType, isApiSuccess } from '@/shared/types';

const connectors = ref<Connector[]>([]);
const loading = ref(false);
const activeTab = ref<ConnectorType>(ConnectorType.DATABASE);
const showTestDialog = ref(false);
const currentConnector = ref<Connector | null>(null);
const testing = ref(false);
const testResult = ref<{
  success: boolean;
  message: string;
  responseTimeMs: number;
} | null>(null);

const testConfig = ref<DatabaseConfig | ProtocolConfig>({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: '',
} as DatabaseConfig);

const databaseConnectors = computed(() =>
  connectors.value.filter(
    (c: Connector) => c.connectorType === ConnectorType.DATABASE,
  ),
);

const protocolConnectors = computed(() =>
  connectors.value.filter(
    (c: Connector) => c.connectorType === ConnectorType.PROTOCOL,
  ),
);

const visibleConnectors = computed(() =>
  activeTab.value === ConnectorType.DATABASE
    ? databaseConnectors.value
    : protocolConnectors.value,
);

onMounted(loadConnectors);

async function loadConnectors() {
  loading.value = true;
  try {
    const response = await connectorApi.list();
    if (isApiSuccess(response)) {
      connectors.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

function openTest(connector: Connector) {
  currentConnector.value = connector;
  testResult.value = null;
  if (connector.connectorType === ConnectorType.DATABASE) {
    testConfig.value = {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      username: 'postgres',
      password: '',
    };
  } else {
    testConfig.value = { endpointUri: '', parameters: {} };
  }
  showTestDialog.value = true;
}

async function runTest() {
  if (!currentConnector.value) return;
  testing.value = true;
  try {
    const response =
      currentConnector.value.connectorType === ConnectorType.DATABASE
        ? await connectorApi.validateDatabase(
            currentConnector.value.connectorId,
            testConfig.value as DatabaseConfig,
          )
        : await connectorApi.validateProtocol(
            currentConnector.value.connectorId,
            testConfig.value as ProtocolConfig,
          );
    if (isApiSuccess(response)) {
      testResult.value = response.data;
    }
  } catch {
    testResult.value = {
      success: false,
      message: '测试失败',
      responseTimeMs: 0,
    };
  } finally {
    testing.value = false;
  }
}

function statusVariant(status: string) {
  return status === 'ACTIVE' ? 'success' : 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane title="连接器管理" description="查看并测试数据库与协议连接器">
      <div class="page__toolbar">
        <button
          class="page__tab"
          :class="{ 'page__tab--active': activeTab === ConnectorType.DATABASE }"
          @click="activeTab = ConnectorType.DATABASE"
        >
          数据库 ({{ databaseConnectors.length }})
        </button>
        <button
          class="page__tab"
          :class="{ 'page__tab--active': activeTab === ConnectorType.PROTOCOL }"
          @click="activeTab = ConnectorType.PROTOCOL"
        >
          协议 ({{ protocolConnectors.length }})
        </button>
        <NebulaButton variant="secondary" @click="loadConnectors"
          >刷新</NebulaButton
        >
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="visibleConnectors.length === 0" class="page__empty">
        暂无连接器
      </div>
      <div v-else class="page__grid">
        <article
          v-for="connector in visibleConnectors"
          :key="connector.connectorId"
          class="page__card"
        >
          <div class="page__card-head">
            <h3>{{ connector.connectorId }}</h3>
            <NebulaTag :variant="statusVariant(connector.status)">
              {{ connector.status }}
            </NebulaTag>
          </div>
          <p class="page__meta">
            {{
              connector.connectorType === ConnectorType.DATABASE
                ? connector.databaseType
                : connector.protocolType
            }}
          </p>
          <NebulaButton variant="secondary" @click="openTest(connector)">
            测试连接
          </NebulaButton>
        </article>
      </div>
    </NebulaPane>

    <div
      v-if="showTestDialog"
      class="modal-overlay"
      @click.self="showTestDialog = false"
    >
      <NebulaPane
        :title="`测试 - ${currentConnector?.connectorId}`"
        class="modal"
      >
        <template
          v-if="currentConnector?.connectorType === ConnectorType.DATABASE"
        >
          <label class="field"
            ><span>主机</span
            ><input v-model="(testConfig as DatabaseConfig).host"
          /></label>
          <label class="field"
            ><span>端口</span
            ><input
              v-model.number="(testConfig as DatabaseConfig).port"
              type="number"
          /></label>
          <label class="field"
            ><span>数据库</span
            ><input v-model="(testConfig as DatabaseConfig).database"
          /></label>
          <label class="field"
            ><span>用户名</span
            ><input v-model="(testConfig as DatabaseConfig).username"
          /></label>
          <label class="field"
            ><span>密码</span
            ><input
              v-model="(testConfig as DatabaseConfig).password"
              type="password"
          /></label>
        </template>
        <template v-else>
          <label class="field"
            ><span>端点 URI</span
            ><input v-model="(testConfig as ProtocolConfig).endpointUri"
          /></label>
        </template>

        <div
          v-if="testResult"
          class="test-result"
          :class="{ 'test-result--ok': testResult.success }"
        >
          {{ testResult.success ? '连接成功' : '连接失败' }} —
          {{ testResult.message }} ({{ testResult.responseTimeMs }}ms)
        </div>

        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showTestDialog = false"
            >关闭</NebulaButton
          >
          <NebulaButton :disabled="testing" @click="runTest">
            {{ testing ? '测试中…' : '测试' }}
          </NebulaButton>
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
  align-items: center;
  margin-bottom: 16px;
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

.page__grid {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.page__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  margin-bottom: 12px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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

.modal {
  width: min(480px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field input {
  padding: 8px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.test-result {
  margin: 12px 0;
  padding: 10px;
  font-size: 13px;
  border-radius: 6px;
  background: hsl(var(--destructive) / 12%);
  color: hsl(var(--destructive));
}

.test-result--ok {
  background: hsl(var(--success) / 12%);
  color: hsl(var(--success));
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
