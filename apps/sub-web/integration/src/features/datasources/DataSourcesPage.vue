<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { connectorApi, dataSourceApi } from '@/shared/api/integration';
import type {
  Connector,
  DataSourceConfig,
  DatabaseConfig,
  ProtocolConfig,
} from '@/shared/types';
import { ConnectorType, isApiSuccess } from '@/shared/types';

const dataSources = ref<DataSourceConfig[]>([]);
const connectors = ref<Connector[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const showEdit = ref(false);
const editing = ref<DataSourceConfig | null>(null);
const testNotice = ref<string | null>(null);

const form = ref({
  name: '',
  connectorId: '',
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: '',
  endpointUri: '',
});

onMounted(async () => {
  await Promise.all([loadDataSources(), loadConnectors()]);
});

async function loadDataSources() {
  loading.value = true;
  try {
    const response = await dataSourceApi.list();
    if (isApiSuccess(response)) {
      dataSources.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

async function loadConnectors() {
  const response = await connectorApi.getDatabaseConnectors();
  if (isApiSuccess(response)) {
    connectors.value = response.data;
  }
}

function selectedConnector(): Connector | undefined {
  return connectors.value.find(
    (c: Connector) => c.connectorId === form.value.connectorId,
  );
}

function resetForm() {
  form.value = {
    name: '',
    connectorId: connectors.value[0]?.connectorId ?? '',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '',
    endpointUri: '',
  };
}

function openCreate() {
  resetForm();
  showCreate.value = true;
}

function openEdit(ds: DataSourceConfig) {
  editing.value = { ...ds, config: { ...ds.config } };
  showEdit.value = true;
}

async function handleCreate() {
  const connector = selectedConnector();
  const config: DatabaseConfig | ProtocolConfig =
    connector?.connectorType === ConnectorType.PROTOCOL
      ? { endpointUri: form.value.endpointUri, parameters: {} }
      : {
          host: form.value.host,
          port: form.value.port,
          database: form.value.database,
          username: form.value.username,
          password: form.value.password,
        };

  const response = await dataSourceApi.create({
    dataSourceId: '',
    name: form.value.name,
    connectorId: form.value.connectorId,
    config,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  });
  if (isApiSuccess(response)) {
    showCreate.value = false;
    await loadDataSources();
  }
}

async function handleUpdate() {
  if (!editing.value) return;
  await dataSourceApi.update(editing.value.dataSourceId, editing.value);
  showEdit.value = false;
  await loadDataSources();
}

async function handleDelete(id: string) {
  await dataSourceApi.delete(id);
  await loadDataSources();
}

async function handleTest(id: string) {
  testNotice.value = null;
  const response = await dataSourceApi.testConnection(id);
  if (isApiSuccess(response)) {
    testNotice.value = `连接测试: ${response.data.message} (${response.data.responseTimeMs}ms)`;
  }
}
</script>

<template>
  <div class="page">
    <NebulaPane title="数据源管理" description="基于连接器创建与管理数据源">
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="openCreate"
          >新建数据源</NebulaButton
        >
        <NebulaButton variant="outline" @click="loadDataSources"
          >刷新</NebulaButton
        >
      </div>
      <p v-if="testNotice" class="page__notice">{{ testNotice }}</p>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="dataSources.length === 0" class="page__empty">
        暂无数据源
      </div>
      <div v-else class="page__list">
        <article
          v-for="ds in dataSources"
          :key="ds.dataSourceId"
          class="page__card"
        >
          <div class="page__card-head">
            <div>
              <h3>{{ ds.name }}</h3>
              <p class="page__meta">
                {{ ds.connectorId }} · {{ ds.dataSourceId }}
              </p>
            </div>
            <NebulaTag
              :variant="ds.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ ds.status }}
            </NebulaTag>
          </div>
          <div class="page__actions">
            <NebulaButton variant="outline" @click="openEdit(ds)"
              >编辑</NebulaButton
            >
            <NebulaButton variant="outline" @click="handleTest(ds.dataSourceId)"
              >测试</NebulaButton
            >
            <NebulaButton
              variant="outline"
              @click="handleDelete(ds.dataSourceId)"
              >删除</NebulaButton
            >
          </div>
        </article>
      </div>
    </NebulaPane>

    <div
      v-if="showCreate"
      class="modal-overlay"
      @click.self="showCreate = false"
    >
      <NebulaPane title="新建数据源" class="modal">
        <label class="field"
          ><span>名称</span><input v-model="form.name"
        /></label>
        <label class="field">
          <span>连接器</span>
          <select v-model="form.connectorId" class="field__select">
            <option
              v-for="c in connectors"
              :key="c.connectorId"
              :value="c.connectorId"
            >
              {{ c.connectorId }}
            </option>
          </select>
        </label>
        <template
          v-if="selectedConnector()?.connectorType !== ConnectorType.PROTOCOL"
        >
          <label class="field"
            ><span>主机</span><input v-model="form.host"
          /></label>
          <label class="field"
            ><span>端口</span><input v-model.number="form.port" type="number"
          /></label>
          <label class="field"
            ><span>数据库</span><input v-model="form.database"
          /></label>
          <label class="field"
            ><span>用户名</span><input v-model="form.username"
          /></label>
          <label class="field"
            ><span>密码</span><input v-model="form.password" type="password"
          /></label>
        </template>
        <label v-else class="field"
          ><span>端点 URI</span><input v-model="form.endpointUri"
        /></label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showCreate = false"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="handleCreate"
            >创建</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>

    <div
      v-if="showEdit && editing"
      class="modal-overlay"
      @click.self="showEdit = false"
    >
      <NebulaPane title="编辑数据源" class="modal">
        <label class="field"
          ><span>名称</span><input v-model="editing.name"
        /></label>
        <template v-if="'host' in editing.config">
          <label class="field"
            ><span>主机</span
            ><input v-model="(editing.config as DatabaseConfig).host"
          /></label>
          <label class="field"
            ><span>端口</span
            ><input
              v-model.number="(editing.config as DatabaseConfig).port"
              type="number"
          /></label>
          <label class="field"
            ><span>数据库</span
            ><input v-model="(editing.config as DatabaseConfig).database"
          /></label>
        </template>
        <label v-else class="field"
          ><span>端点</span
          ><input v-model="(editing.config as ProtocolConfig).endpointUri"
        /></label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showEdit = false"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="handleUpdate"
            >保存</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>
  </div>
</template>
