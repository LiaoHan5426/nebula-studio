<script setup lang="ts">
import {
  NebulaButton,
  NebulaPane,
  NebulaSelect,
} from '@nebula-studio/nebula-ui';

import ServiceGovernanceDialog from './components/governance/ServiceGovernanceDialog.vue';
import ServiceGovernanceTables from './components/governance/ServiceGovernanceTables.vue';
import { useServiceGovernance } from './composables/useServiceGovernance';
import type { GovernanceTab } from './governance/types';

const {
  activeTab,
  rules,
  circuitBreakers,
  whitelistRules,
  tenants,
  selectedTenantId,
  loading,
  showDialog,
  editingCircuit,
  rateLimitForm,
  circuitForm,
  whitelistForm,
  tabLabels,
  loadCurrentTab,
  openCreate,
  openEditRateLimit,
  openEditCircuit,
  openEditWhitelist,
  submitDialog,
  handleOfflineRateLimit,
  handleOfflineCircuit,
  handleOfflineWhitelist,
  manageableServices,
  dialogTitle,
  createButtonLabel,
} = useServiceGovernance();
</script>

<template>
  <div class="page">
    <NebulaPane
      title="服务治理"
      description="按租户配置限流、熔断与白名单。仅本人发布的服务可新建/修改；获权服务为只读。"
    >
      <div class="page__toolbar governance-toolbar">
        <div v-if="tenants.length" class="governance-toolbar__tenant">
          <label>治理租户</label>
          <NebulaSelect
            v-model="selectedTenantId"
            :options="tenants"
            label-key="tenantName"
            value-key="tenantId"
            class="governance-toolbar__tenant-select"
          />
        </div>
        <NebulaButton variant="outline" @click="loadCurrentTab"
          >刷新</NebulaButton
        >
        <NebulaButton
          variant="primary"
          :disabled="!selectedTenantId"
          @click="openCreate"
        >
          {{ createButtonLabel }}
        </NebulaButton>
      </div>

      <div class="governance-tabs" role="tablist">
        <button
          v-for="(label, key) in tabLabels"
          :key="key"
          type="button"
          role="tab"
          class="governance-tabs__tab"
          :class="{ 'governance-tabs__tab--active': activeTab === key }"
          @click="activeTab = key as GovernanceTab"
        >
          {{ label }}
        </button>
      </div>

      <div v-if="!selectedTenantId" class="page__empty">
        请先创建租户后再配置治理规则
      </div>

      <ServiceGovernanceTables
        v-else
        :active-tab="activeTab"
        :loading="loading"
        :rules="rules"
        :circuit-breakers="circuitBreakers"
        :whitelist-rules="whitelistRules"
        @edit-rate-limit="openEditRateLimit"
        @edit-circuit="openEditCircuit"
        @edit-whitelist="openEditWhitelist"
        @offline-rate-limit="handleOfflineRateLimit"
        @offline-circuit="handleOfflineCircuit"
        @offline-whitelist="handleOfflineWhitelist"
      />
    </NebulaPane>

    <ServiceGovernanceDialog
      :open="showDialog"
      :active-tab="activeTab"
      :title="dialogTitle"
      :rate-limit-form="rateLimitForm"
      :circuit-form="circuitForm"
      :whitelist-form="whitelistForm"
      :manageable-services="manageableServices"
      :editing-circuit="editingCircuit"
      @close="showDialog = false"
      @submit="submitDialog"
      @update:rate-limit-form="rateLimitForm = $event"
      @update:circuit-form="circuitForm = $event"
      @update:whitelist-form="whitelistForm = $event"
    />
  </div>
</template>

<style scoped>
.governance-toolbar {
  flex-wrap: wrap;
}

.governance-toolbar__tenant {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.governance-toolbar__tenant-select {
  min-width: 220px;
}

.governance-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.governance-tabs__tab {
  padding: 8px 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.governance-tabs__tab--active {
  color: hsl(var(--foreground));
  background: hsl(var(--accent));
  border-color: hsl(var(--primary));
}
</style>
