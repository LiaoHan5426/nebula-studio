<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { connectorApi } from '@/shared/api/integration';
import type { Connector, DatabaseConfig, ProtocolConfig } from '@/shared/types';
import { ConnectorType, isApiSuccess } from '@/shared/types';

const props = defineProps<{
  connectorType: ConnectorType;
  pluginVersionsByConnectorId?: Record<
    string,
    { name: string; version: string }
  >;
}>();

const connectors = ref<Connector[]>([]);
const loading = ref(false);
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

const visibleConnectors = computed(() =>
  connectors.value.filter((c) => c.connectorType === props.connectorType),
);

const sectionTitle = computed(() =>
  props.connectorType === ConnectorType.DATABASE
    ? '已激活数据库连接器'
    : '已激活协议连接器',
);

onMounted(loadConnectors);

async function loadConnectors() {
  loading.value = true;
  try {
    const response = await connectorApi.list();
    if (isApiSuccess(response)) {
      const seen = new Set<string>();
      connectors.value = response.data.filter((c) => {
        if (!c.connectorId || seen.has(c.connectorId)) return false;
        seen.add(c.connectorId);
        return true;
      });
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

function resolvePluginName(connector: Connector): string | undefined {
  return (
    connector.pluginName ??
    props.pluginVersionsByConnectorId?.[connector.connectorId]?.name
  );
}

function resolvePluginVersion(connector: Connector): string | undefined {
  return (
    connector.pluginVersion ??
    props.pluginVersionsByConnectorId?.[connector.connectorId]?.version
  );
}

function resolveTypeLabel(connector: Connector): string {
  if (connector.connectorType === ConnectorType.DATABASE) {
    return connector.databaseType ?? 'DATABASE';
  }
  return connector.protocolType ?? 'PROTOCOL';
}
</script>

<template>
  <NebulaPane
    :title="sectionTitle"
    description="插件激活后由 PF4J 注册为运行时连接器，供数据源与接口编排选用。"
  >
    <div class="connector-section__toolbar">
      <NebulaButton variant="outline" @click="loadConnectors"
        >刷新</NebulaButton
      >
    </div>

    <div v-if="loading" class="connector-section__empty">加载中…</div>
    <div
      v-else-if="visibleConnectors.length === 0"
      class="connector-section__empty"
    >
      暂无已激活连接器，请先上传并激活对应插件。
    </div>
    <div v-else class="connector-section__list">
      <article
        v-for="(connector, index) in visibleConnectors"
        :key="`${connector.connectorId}-${connector.pluginVersion ?? 'na'}-${index}`"
        class="connector-section__row"
      >
        <div class="connector-section__row-main">
          <span class="connector-section__name">{{
            connector.connectorId
          }}</span>
          <span
            v-if="
              resolvePluginName(connector) || resolvePluginVersion(connector)
            "
            class="connector-section__version"
          >
            {{ resolvePluginName(connector) ?? connector.connectorId }}
            <template v-if="resolvePluginVersion(connector)">
              · v{{ resolvePluginVersion(connector) }}
            </template>
          </span>
        </div>
        <NebulaTag variant="info">
          {{ resolveTypeLabel(connector) }}
        </NebulaTag>
        <div class="connector-section__row-actions">
          <NebulaTag :variant="statusVariant(connector.status)">
            {{ connector.status }}
          </NebulaTag>
          <NebulaButton variant="outline" @click="openTest(connector)">
            测试连接
          </NebulaButton>
        </div>
      </article>
    </div>

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
          <label class="field">
            <span>主机</span>
            <input v-model="(testConfig as DatabaseConfig).host" />
          </label>
          <label class="field">
            <span>端口</span>
            <input
              v-model.number="(testConfig as DatabaseConfig).port"
              type="number"
            />
          </label>
          <label class="field">
            <span>数据库</span>
            <input v-model="(testConfig as DatabaseConfig).database" />
          </label>
          <label class="field">
            <span>用户名</span>
            <input v-model="(testConfig as DatabaseConfig).username" />
          </label>
          <label class="field">
            <span>密码</span>
            <input
              v-model="(testConfig as DatabaseConfig).password"
              type="password"
            />
          </label>
        </template>
        <template v-else>
          <label class="field">
            <span>端点 URI</span>
            <input v-model="(testConfig as ProtocolConfig).endpointUri" />
          </label>
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
          <NebulaButton variant="outline" @click="showTestDialog = false">
            关闭
          </NebulaButton>
          <NebulaButton variant="primary" :disabled="testing" @click="runTest">
            {{ testing ? '测试中…' : '测试' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </NebulaPane>
</template>

<style scoped>
.connector-section__toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.connector-section__empty {
  padding: 24px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.connector-section__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connector-section__row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: hsl(var(--muted) / 18%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 10px;
}

.connector-section__row-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.connector-section__name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.connector-section__version {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.connector-section__row-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.test-result {
  padding: 10px;
  margin: 12px 0;
  font-size: 13px;
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 12%);
  border-radius: 6px;
}

.test-result--ok {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}
</style>
