import { ref } from 'vue';

import { tenantApi } from '@/shared/api/integration';
import { isApiSuccess } from '@/shared/types';

const currentTenantId = ref('');
const currentTenantName = ref('');
const loading = ref(false);

export function useTenant() {
  async function refreshCurrent() {
    loading.value = true;
    try {
      const response = await tenantApi.getCurrent();
      if (isApiSuccess(response)) {
        currentTenantId.value = response.data.tenantId ?? '';
        currentTenantName.value =
          response.data.tenantName ?? response.data.tenantId ?? '';
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    currentTenantId,
    currentTenantName,
    loading,
    refreshCurrent,
  };
}
