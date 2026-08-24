<script setup lang="ts">
import type {
  Connector,
  DatabaseConfig,
  DataSourceConfig,
  ProtocolConfig,
} from '@/shared/types';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaDialog,
  NebulaPane,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { dataSourceApi } from '@/shared/api/integration';
import { ConnectorType, isApiSuccess } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import {
  databaseConnectorsQueryOptions,
  dataSourcesQueryKey,
  dataSourcesQueryOptions,
} from './queryOptions';

const { t } = useI18n();
const queryClient = useQueryClient();
const showCreate = ref(false);
const showEdit = ref(false);
const editing = ref<DataSourceConfig | null>(null);
const testNotice = ref<null | string>(null);

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

const sourcesQuery = useQuery(() => dataSourcesQueryOptions());
const connectorsQuery = useQuery(() => databaseConnectorsQueryOptions());

const dataSources = computed(() => sourcesQuery.data.value ?? []);
const connectors = computed(() => connectorsQuery.data.value ?? []);
const loading = computed(() => sourcesQuery.isPending.value);

watch(
  connectors,
  (list) => {
    if (!form.value.connectorId && list[0]) {
      form.value.connectorId = list[0].connectorId;
    }
  },
  { immediate: true },
);

function selectedConnector(): Connector | undefined {
  return connectors.value.find(
    (connector: Connector) => connector.connectorId === form.value.connectorId,
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

async function invalidateSources() {
  await queryClient.invalidateQueries({ queryKey: dataSourcesQueryKey() });
}

const createMutation = useMutation({
  mutationFn: (payload: DataSourceConfig) => dataSourceApi.create(payload),
});

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

  const response = await createMutation.mutateAsync({
    dataSourceId: '',
    name: form.value.name,
    connectorId: form.value.connectorId,
    config,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  });
  if (isApiSuccess(response)) {
    showCreate.value = false;
    await invalidateSources();
  }
}

async function handleUpdate() {
  if (!editing.value) return;
  await dataSourceApi.update(editing.value.dataSourceId, editing.value);
  showEdit.value = false;
  await invalidateSources();
}

async function handleDelete(id: string) {
  await dataSourceApi.delete(id);
  await invalidateSources();
}

async function handleTest(id: string) {
  testNotice.value = null;
  const response = await dataSourceApi.testConnection(id);
  if (isApiSuccess(response)) {
    testNotice.value = t('datasources.testNotice', {
      message: response.data.message,
      ms: response.data.responseTimeMs,
    });
  }
}

function loadDataSources() {
  void sourcesQuery.refetch();
}
</script>

<template>
  <div class="page">
    <NebulaPane
      :title="t('datasources.title')"
      :description="t('datasources.description')"
    >
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="openCreate">
          {{ t('datasources.create') }}
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadDataSources">
          {{ t('common.refresh') }}
        </NebulaButton>
      </div>
      <p v-if="testNotice" class="page__notice">{{ testNotice }}</p>

      <div v-if="loading" class="page__empty">{{ t('common.loading') }}</div>
      <div v-else-if="dataSources.length === 0" class="page__empty">
        {{ t('datasources.empty') }}
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
            <NebulaButton variant="outline" @click="openEdit(ds)">
              {{ t('datasources.edit') }}
            </NebulaButton>
            <NebulaButton
              variant="outline"
              @click="handleTest(ds.dataSourceId)"
            >
              {{ t('datasources.test') }}
            </NebulaButton>
            <NebulaButton
              variant="outline"
              @click="handleDelete(ds.dataSourceId)"
            >
              {{ t('datasources.delete') }}
            </NebulaButton>
          </div>
        </article>
      </div>
    </NebulaPane>

    <NebulaDialog
      :open="showCreate"
      :title="t('datasources.create')"
      @update:open="showCreate = $event"
    >
      <label class="field"
        ><span>{{ t('datasources.fields.name') }}</span
        ><input v-model="form.name"
      /></label>
      <label class="field">
        <span>{{ t('datasources.fields.connector') }}</span>
        <select v-model="form.connectorId" class="field__select">
          <option
            v-for="(c, index) in connectors"
            :key="`${c.connectorId}-${index}`"
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
          ><span>{{ t('datasources.fields.host') }}</span
          ><input v-model="form.host"
        /></label>
        <label class="field"
          ><span>{{ t('datasources.fields.port') }}</span
          ><input v-model.number="form.port" type="number"
        /></label>
        <label class="field"
          ><span>{{ t('datasources.fields.database') }}</span
          ><input v-model="form.database"
        /></label>
        <label class="field"
          ><span>{{ t('datasources.fields.username') }}</span
          ><input v-model="form.username"
        /></label>
        <label class="field"
          ><span>{{ t('datasources.fields.password') }}</span
          ><input v-model="form.password" type="password"
        /></label>
      </template>
      <label v-else class="field"
        ><span>{{ t('datasources.fields.endpoint') }}</span
        ><input v-model="form.endpointUri"
      /></label>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="showCreate = false">
          {{ t('datasources.cancel') }}
        </NebulaButton>
        <NebulaButton variant="primary" @click="handleCreate">
          {{ t('datasources.saveCreate') }}
        </NebulaButton>
      </div>
    </NebulaDialog>

    <NebulaDialog
      :open="showEdit && Boolean(editing)"
      :title="t('datasources.edit')"
      @update:open="showEdit = $event"
    >
      <template v-if="editing">
        <label class="field"
          ><span>{{ t('datasources.fields.name') }}</span
          ><input v-model="editing.name"
        /></label>
        <template v-if="'host' in editing.config">
          <label class="field"
            ><span>{{ t('datasources.fields.host') }}</span
            ><input v-model="(editing.config as DatabaseConfig).host"
          /></label>
          <label class="field"
            ><span>{{ t('datasources.fields.port') }}</span
            ><input
              v-model.number="(editing.config as DatabaseConfig).port"
              type="number"
          /></label>
          <label class="field"
            ><span>{{ t('datasources.fields.database') }}</span
            ><input v-model="(editing.config as DatabaseConfig).database"
          /></label>
        </template>
        <label v-else class="field"
          ><span>{{ t('datasources.fields.endpoint') }}</span
          ><input v-model="(editing.config as ProtocolConfig).endpointUri"
        /></label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showEdit = false">
            {{ t('datasources.cancel') }}
          </NebulaButton>
          <NebulaButton variant="primary" @click="handleUpdate">
            {{ t('datasources.save') }}
          </NebulaButton>
        </div>
      </template>
    </NebulaDialog>
  </div>
</template>
