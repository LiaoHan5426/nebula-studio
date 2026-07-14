<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { interfaceApi } from '@/shared/api/integration';
import { useAuth } from '@/shared/composables/useAuth';
import type { ApiInterface, AtomicInterface } from '@/shared/types';
import {
  InterfaceAuthType,
  InterfaceMethod,
  InterfaceStatus,
  InterfaceType,
  isApiSuccess,
} from '@/shared/types';

const services = ref<ApiInterface[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const { isPlatformAdmin } = useAuth();

const atomicServices = computed(() =>
  services.value.filter((item) => item.interfaceType === InterfaceType.ATOMIC),
);

const form = ref<Partial<AtomicInterface>>({
  interfaceName: '',
  endpointUri: '/orders/query',
  method: InterfaceMethod.GET,
  connectorId: 'http-connector',
  status: InterfaceStatus.DRAFT,
  authConfig: {
    authType: InterfaceAuthType.API_KEY,
    apiKeyHeader: 'X-API-Key',
    allowedTenants: ['*'],
  },
  requestMapping: {},
  responseMapping: {},
  requestSchema: { type: 'object', fields: {} },
  responseSchema: { type: 'object', fields: {} },
});

onMounted(loadServices);

async function loadServices() {
  loading.value = true;
  try {
    const response = await interfaceApi.list({
      pageSize: 100,
      interfaceType: InterfaceType.ATOMIC,
    });
    if (isApiSuccess(response)) {
      services.value = response.data.items ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = {
    interfaceName: '',
    endpointUri: '/orders/query',
    method: InterfaceMethod.GET,
    connectorId: 'http-connector',
    status: InterfaceStatus.DRAFT,
    authConfig: {
      authType: InterfaceAuthType.API_KEY,
      apiKeyHeader: 'X-API-Key',
      allowedTenants: ['*'],
    },
    requestMapping: {},
    responseMapping: {},
    requestSchema: { type: 'object', fields: {} },
    responseSchema: { type: 'object', fields: {} },
  };
  showDialog.value = true;
}

function openEdit(service: ApiInterface) {
  form.value = { ...(service as AtomicInterface) };
  showDialog.value = true;
}

async function saveService() {
  const payload = form.value;
  const response = payload.interfaceId
    ? await interfaceApi.update(payload.interfaceId, payload)
    : await interfaceApi.create({
        ...payload,
        interfaceType: InterfaceType.ATOMIC,
      });
  if (isApiSuccess(response)) {
    showDialog.value = false;
    await loadServices();
  }
}

async function handleDelete(service: ApiInterface) {
  await interfaceApi.delete(service.interfaceId);
  await loadServices();
}

function connectorLabel(connectorId?: string) {
  if (!connectorId) return '-';
  if (connectorId.includes('postgre')) return 'PostgreSQL';
  if (connectorId.includes('mysql')) return 'MySQL';
  if (connectorId.includes('http')) return 'HTTP';
  return connectorId;
}

function statusVariant(status: string) {
  if (status === InterfaceStatus.ACTIVE) return 'success';
  if (status === InterfaceStatus.DRAFT) return 'warning';
  return 'default';
}

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="服务注册"
      :description="
        isPlatformAdmin
          ? '注册原子服务：配置端点、连接器与认证信息。发布请前往「服务发布」。'
          : '仅管理本人注册的原子服务。发布请前往「服务发布」并提交审批。'
      "
    >
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="openCreate">
          注册原子服务
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadServices"
          >刷新</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="atomicServices"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="interfaceId"
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
            min-width="160"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="method" title="方法" width="80" />
          <NebulaTableColumn field="connectorId" title="连接器" width="120">
            <template #default="{ row }">
              {{ connectorLabel(row.connectorId) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="status" title="状态" width="100">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ row.status }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdAt" title="注册时间" width="150">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="160">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton variant="outline" @click="openEdit(row)">
                  编辑
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

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <NebulaPane
        :title="form.interfaceId ? '编辑原子服务' : '注册原子服务'"
        class="modal"
      >
        <label class="field">
          <span>服务名称</span>
          <input v-model="form.interfaceName" />
        </label>
        <label class="field">
          <span>端点 URI</span>
          <input v-model="form.endpointUri" />
        </label>
        <label class="field">
          <span>方法</span>
          <select v-model="form.method" class="field__select">
            <option
              v-for="method in Object.values(InterfaceMethod)"
              :key="method"
              :value="method"
            >
              {{ method }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>连接器 ID</span>
          <input v-model="form.connectorId" placeholder="http-connector" />
        </label>
        <label class="field">
          <span>认证方式</span>
          <select v-model="form.authConfig!.authType" class="field__select">
            <option
              v-for="auth in Object.values(InterfaceAuthType)"
              :key="auth"
              :value="auth"
            >
              {{ auth }}
            </option>
          </select>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="saveService"
            >保存</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>
  </div>
</template>
