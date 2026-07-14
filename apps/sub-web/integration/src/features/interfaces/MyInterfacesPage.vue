<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { tenantApi } from '@/shared/api/consoleApi';
import { interfaceApi } from '@/shared/api/integration';
import { useTenant } from '@/shared/composables/useTenant';
import type { ApiInterface } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

const services = ref<ApiInterface[]>([]);
const allowedIds = ref<string[] | null>(null);
const loading = ref(false);
const { currentTenantId } = useTenant();

const visibleServices = computed(() => {
  if (!allowedIds.value || allowedIds.value.includes('*')) {
    return services.value;
  }
  const allowed = new Set(allowedIds.value);
  return services.value.filter((item) => allowed.has(item.interfaceId));
});

onMounted(async () => {
  await Promise.all([loadTenantAccess(), loadServices()]);
});

async function loadTenantAccess() {
  const response = await tenantApi.get(currentTenantId.value);
  if (isApiSuccess(response)) {
    allowedIds.value = response.data.allowedInterfaces ?? ['*'];
  }
}

async function loadServices() {
  loading.value = true;
  try {
    const response = await interfaceApi.list({
      pageSize: 100,
      status: 'ACTIVE',
    });
    if (isApiSuccess(response)) {
      services.value = response.data.items ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function serviceTypeLabel(item: ApiInterface) {
  return item.interfaceType === 'COMPOSITE' ? '组合服务' : '原子服务';
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="我的服务"
      description="当前租户已授权且已发布的服务，供对接方查阅网关路径与鉴权方式"
    >
      <div class="page__toolbar">
        <NebulaButton variant="outline" @click="loadServices"
          >刷新</NebulaButton
        >
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="visibleServices"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="interfaceId"
        >
          <NebulaTableColumn
            field="interfaceId"
            title="服务 ID"
            min-width="160"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="interfaceName"
            title="服务名称"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn title="类型" width="100">
            <template #default="{ row }">
              {{ serviceTypeLabel(row) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn
            field="endpointUri"
            title="路径"
            min-width="160"
            show-overflow="tooltip"
          />
          <NebulaTableColumn field="method" title="方法" width="80" />
          <NebulaTableColumn field="status" title="状态" width="100">
            <template #default="{ row }">
              <NebulaTag variant="success">{{ row.status }}</NebulaTag>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>
  </div>
</template>
