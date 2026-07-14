<script setup lang="ts">
import type { TenantRecord } from '@/features/tenant/api';

defineProps<{
  tenants: TenantRecord[];
  selectedTenantId: string;
  allowedSummary: string;
}>();

const emit = defineEmits<{
  'update:selectedTenantId': [value: string];
}>();
</script>

<template>
  <div class="authorize-tenant">
    <label for="tenant-select">授权目标租户</label>
    <select
      id="tenant-select"
      :value="selectedTenantId"
      @change="
        emit(
          'update:selectedTenantId',
          ($event.target as HTMLSelectElement).value,
        )
      "
    >
      <option v-for="t in tenants" :key="t.tenantId" :value="t.tenantId">
        {{ t.tenantName }} ({{ t.tenantId }})
      </option>
    </select>
    <p v-if="selectedTenantId" class="authorize-tenant__summary">
      {{ allowedSummary }}
    </p>
  </div>
</template>

<style scoped>
.authorize-tenant {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.authorize-tenant select {
  min-width: 220px;
  padding: 6px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.authorize-tenant__summary {
  margin: 4px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
