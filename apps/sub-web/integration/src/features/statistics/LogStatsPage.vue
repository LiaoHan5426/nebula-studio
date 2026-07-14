<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
} from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/shared/api/consoleApi';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

const stats = ref<Array<Record<string, unknown>>>([]);
const loading = ref(false);
const dateRange = ref<[string, string] | null>(null);
const { currentTenantId } = useTenant();

onMounted(() => {
  void loadStats();
});

async function loadStats() {
  loading.value = true;
  try {
    const response = await monitorApi.interfaceRanking(currentTenantId.value);
    if (isApiSuccess(response)) {
      stats.value = (response.data ?? []).map((row) => ({
        tenantId: currentTenantId.value,
        interfaceId: row.interfaceId ?? row.interface_id,
        interfaceName:
          row.interfaceName ?? row.interface_name ?? row.interfaceId,
        totalCalls: row.totalCalls ?? row.callCount ?? 0,
        successRate: row.successRate ?? row.success_rate ?? '-',
        avgDuration: row.avgDuration ?? row.avg_latency_ms ?? '-',
      }));
    }
  } finally {
    loading.value = false;
  }
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
