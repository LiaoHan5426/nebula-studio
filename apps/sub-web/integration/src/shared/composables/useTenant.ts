import { computed, ref } from 'vue';

import { tenantApi } from '@/shared/api/integration';
import { isApiSuccess } from '@/shared/types';

const TENANT_KEY = 'tenant_id';
const DEFAULT_TENANTS = ['tenant-a', 'tenant-b'] as const;

const currentTenantId = ref(
  localStorage.getItem(TENANT_KEY) ?? DEFAULT_TENANTS[0],
);
const tenantName = ref('');
const loading = ref(false);

if (!localStorage.getItem(TENANT_KEY)) {
  localStorage.setItem(TENANT_KEY, currentTenantId.value);
}

export function useTenant() {
  const availableTenants = computed(() => [...DEFAULT_TENANTS]);

  async function refreshCurrent() {
    loading.value = true;
    try {
      const response = await tenantApi.getCurrent();
      if (isApiSuccess(response)) {
        currentTenantId.value = response.data.tenantId;
        tenantName.value = response.data.tenantName;
        localStorage.setItem(TENANT_KEY, response.data.tenantId);
      }
    } finally {
      loading.value = false;
    }
  }

  async function switchTenant(tenantId: string) {
    loading.value = true;
    try {
      const response = await tenantApi.switch(tenantId);
      if (isApiSuccess(response)) {
        currentTenantId.value = tenantId;
        localStorage.setItem(TENANT_KEY, tenantId);
        tenantName.value =
          tenantId === 'tenant-a'
            ? 'Tenant A'
            : tenantId === 'tenant-b'
              ? 'Tenant B'
              : tenantId;
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    currentTenantId,
    tenantName,
    availableTenants,
    loading,
    refreshCurrent,
    switchTenant,
  };
}
