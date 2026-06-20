import { ref } from 'vue';

import { tenantApi } from '@/shared/api/consoleApi';
import type { TenantRecord } from '@/shared/api/consoleApi';
import { isApiSuccess } from '@/shared/types';

const STORAGE_KEY = 'tenant_id';
const currentTenantId = ref(localStorage.getItem(STORAGE_KEY) ?? '');
const currentTenantName = ref('');
const tenantOptions = ref<TenantRecord[]>([]);
const loading = ref(false);

function pickDefaultTenant(tenants: TenantRecord[]): TenantRecord | undefined {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const match = tenants.find((t) => t.tenantId === stored);
    if (match) return match;
  }
  return tenants[0];
}

export function useTenant() {
  function setCurrentTenant(tenantId: string, tenantName?: string) {
    localStorage.setItem(STORAGE_KEY, tenantId);
    currentTenantId.value = tenantId;
    currentTenantName.value = tenantName ?? tenantId;
  }

  async function loadTenantOptions() {
    const response = await tenantApi.mine();
    if (!isApiSuccess(response)) {
      tenantOptions.value = [];
      currentTenantId.value = '';
      currentTenantName.value = '';
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    tenantOptions.value = response.data ?? [];
    const selected = pickDefaultTenant(tenantOptions.value);
    if (selected) {
      setCurrentTenant(selected.tenantId, selected.tenantName);
    } else {
      currentTenantId.value = '';
      currentTenantName.value = '';
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function refreshCurrent() {
    if (!currentTenantId.value) {
      currentTenantName.value = '';
      return;
    }
    loading.value = true;
    try {
      const response = await tenantApi.get(currentTenantId.value);
      if (isApiSuccess(response)) {
        currentTenantName.value =
          response.data.tenantName ?? response.data.tenantId;
      } else {
        currentTenantName.value = currentTenantId.value;
      }
    } finally {
      loading.value = false;
    }
  }

  async function switchTenant(tenantId: string) {
    const match = tenantOptions.value.find((t) => t.tenantId === tenantId);
    setCurrentTenant(tenantId, match?.tenantName);
    await refreshCurrent();
  }

  function resetTenantSession() {
    tenantOptions.value = [];
    currentTenantId.value = '';
    currentTenantName.value = '';
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    currentTenantId,
    currentTenantName,
    tenantOptions,
    loading,
    setCurrentTenant,
    loadTenantOptions,
    refreshCurrent,
    switchTenant,
    resetTenantSession,
  };
}
