<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  NebulaButton,
  NebulaDatePicker,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { interfaceRankingQueryOptions } from '@/features/monitor/queryOptions';
import { useTenant } from '@/shared/composables/useTenant';
import { useQuery } from '@tanstack/vue-query';

const dateRange = ref<[string, string] | null>(null);
const { currentTenantId } = useTenant();
const statsQuery = useQuery(() =>
  interfaceRankingQueryOptions(currentTenantId.value || undefined),
);
const stats = computed(() => statsQuery.data.value ?? []);
const loading = computed(() => statsQuery.isPending.value);

async function loadStats() {
  await statsQuery.refetch();
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="日志统计"
      description="按服务汇总调用次数、成功率与平均耗时"
    >
      <div class="page__toolbar">
        <NebulaDatePicker v-model="dateRange" type="datetimerange" />
        <NebulaButton variant="outline" @click="loadStats">刷新</NebulaButton>
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="stats"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="interfaceId"
        >
          <NebulaTableColumn
            field="tenantId"
            title="租户 ID"
            width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="interfaceId"
            title="服务 ID"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="interfaceName"
            title="服务名称"
            min-width="140"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="totalCalls"
            title="总调用次数"
            width="120"
          />
          <NebulaTableColumn field="successRate" title="成功率" width="100" />
          <NebulaTableColumn
            field="avgDuration"
            title="平均耗时(ms)"
            width="130"
          />
        </NebulaTable>
      </div>
    </NebulaPane>
  </div>
</template>
