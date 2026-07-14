<script setup lang="ts">
import {
  NebulaButton,
  NebulaInput,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import type {
  CircuitBreakerRow,
  GovernanceTab,
  RuleRow,
  WhitelistRow,
} from '../../governance/types';

defineProps<{
  activeTab: GovernanceTab;
  loading: boolean;
  rules: RuleRow[];
  circuitBreakers: CircuitBreakerRow[];
  whitelistRules: WhitelistRow[];
}>();

const emit = defineEmits<{
  editRateLimit: [row: RuleRow];
  editCircuit: [row: CircuitBreakerRow];
  editWhitelist: [row: WhitelistRow];
  offlineRateLimit: [row: RuleRow];
  offlineCircuit: [row: CircuitBreakerRow];
  offlineWhitelist: [row: WhitelistRow];
}>();
</script>

<template>
  <div v-if="activeTab === 'rateLimit'" class="page__table-wrap">
    <NebulaTable
      :data="rules"
      :loading="loading"
      :scroll-x="{ enabled: true }"
      row-key="ruleId"
    >
      <NebulaTableColumn field="ruleName" title="规则名称" min-width="140" />
      <NebulaTableColumn field="interfaceId" title="服务 ID" min-width="140" />
      <NebulaTableColumn title="限流阈值" width="120">
        <template #default="{ row }">
          {{ row.maxRequests }} / {{ row.windowSeconds }}s
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn field="status" title="状态" width="100">
        <template #default="{ row }">
          <NebulaTag :variant="row.status === 'ACTIVE' ? 'success' : 'default'">
            {{ row.status }}
          </NebulaTag>
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn title="操作" width="160">
        <template #default="{ row }">
          <div class="action-btns">
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage"
              @click="emit('editRateLimit', row)"
            >
              配置
            </NebulaButton>
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage || row.status !== 'ACTIVE'"
              @click="emit('offlineRateLimit', row)"
            >
              下线
            </NebulaButton>
          </div>
        </template>
      </NebulaTableColumn>
    </NebulaTable>
  </div>

  <div v-else-if="activeTab === 'circuitBreaker'" class="page__table-wrap">
    <NebulaTable
      :data="circuitBreakers"
      :loading="loading"
      :scroll-x="{ enabled: true }"
      row-key="interfaceId"
    >
      <NebulaTableColumn field="interfaceId" title="服务 ID" min-width="140" />
      <NebulaTableColumn title="失败率阈值" width="110">
        <template #default="{ row }">{{ row.failureRateThreshold }}%</template>
      </NebulaTableColumn>
      <NebulaTableColumn title="慢调用阈值" width="110">
        <template #default="{ row }">{{ row.slowCallRateThreshold }}%</template>
      </NebulaTableColumn>
      <NebulaTableColumn title="最小调用数" width="100">
        <template #default="{ row }">{{ row.minimumNumberOfCalls }}</template>
      </NebulaTableColumn>
      <NebulaTableColumn title="熔断等待(s)" width="110">
        <template #default="{ row }">{{ row.waitDurationSeconds }}</template>
      </NebulaTableColumn>
      <NebulaTableColumn field="status" title="状态" width="100">
        <template #default="{ row }">
          <NebulaTag :variant="row.status === 'ACTIVE' ? 'success' : 'default'">
            {{ row.status }}
          </NebulaTag>
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn title="操作" width="160">
        <template #default="{ row }">
          <div class="action-btns">
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage"
              @click="emit('editCircuit', row)"
            >
              配置
            </NebulaButton>
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage || row.status !== 'ACTIVE'"
              @click="emit('offlineCircuit', row)"
            >
              下线
            </NebulaButton>
          </div>
        </template>
      </NebulaTableColumn>
    </NebulaTable>
  </div>

  <div v-else class="page__table-wrap">
    <NebulaTable
      :data="whitelistRules"
      :loading="loading"
      :scroll-x="{ enabled: true }"
      row-key="ruleId"
    >
      <NebulaTableColumn field="ruleName" title="规则名称" min-width="140" />
      <NebulaTableColumn field="interfaceId" title="服务 ID" min-width="140">
        <template #default="{ row }">{{
          row.interfaceId || '（租户级）'
        }}</template>
      </NebulaTableColumn>
      <NebulaTableColumn title="IP 列表" min-width="180">
        <template #default="{ row }">{{
          row.whitelistIps.join(', ') || '-'
        }}</template>
      </NebulaTableColumn>
      <NebulaTableColumn field="status" title="状态" width="100">
        <template #default="{ row }">
          <NebulaTag :variant="row.status === 'ACTIVE' ? 'success' : 'default'">
            {{ row.status }}
          </NebulaTag>
        </template>
      </NebulaTableColumn>
      <NebulaTableColumn title="操作" width="160">
        <template #default="{ row }">
          <div class="action-btns">
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage"
              @click="emit('editWhitelist', row)"
            >
              配置
            </NebulaButton>
            <NebulaButton
              variant="outline"
              :disabled="!row.canManage || row.status !== 'ACTIVE'"
              @click="emit('offlineWhitelist', row)"
            >
              下线
            </NebulaButton>
          </div>
        </template>
      </NebulaTableColumn>
    </NebulaTable>
  </div>
</template>

<style scoped>
.action-btns {
  display: inline-flex;
  gap: 6px;
}
</style>
