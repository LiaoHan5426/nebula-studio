<script setup lang="ts">
import { computed } from 'vue';

import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { tenantApi } from '@/features/tenant/api';
import { useTenant } from '@/shared/composables/useTenant';
import { integrationQueryKeys } from '@/shared/query/keys';
import { unwrapApiData } from '@/shared/query/unwrap';
import { useQuery } from '@tanstack/vue-query';

const { currentTenantId } = useTenant();
const servicesQuery = useQuery(() =>
  interfacesQueryOptions('active', { pageSize: 100, status: 'ACTIVE' }),
);
const tenantQuery = useQuery(() => ({
  queryKey: integrationQueryKeys.tenantDetail(currentTenantId.value),
  queryFn: () => unwrapApiData(tenantApi.get(currentTenantId.value)),
}));
const services = computed(() => servicesQuery.data.value?.items ?? []);
const allowedIds = computed(
  () => tenantQuery.data.value?.allowedInterfaces ?? ['*'],
);
const loading = computed(
  () => servicesQuery.isPending.value || tenantQuery.isPending.value,
);
const visibleServices = computed(() => {
  if (allowedIds.value.includes('*')) {
    return services.value;
  }
  const allowed = new Set(allowedIds.value);
  return services.value.filter((item) => allowed.has(item.interfaceId));
});

function loadServices() {
  void servicesQuery.refetch();
}

function serviceTypeLabel(item: { interfaceType?: string }) {
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
        <NebulaButton variant="outline" @click="loadServices">
          刷新
        </NebulaButton>
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
