import { ref } from 'vue';

export interface TenantRecord {
  tenantId: string;
  tenantName?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface TenantApiAdapter {
  mine: () => Promise<ApiResponse<TenantRecord[]>>;
  get: (id: string) => Promise<ApiResponse<TenantRecord>>;
}

export interface UseTenantOptions {
  tenantApi: TenantApiAdapter;
  isApiSuccess: <T>(response: ApiResponse<T>) => boolean;
}

const STORAGE_KEY = 'tenant_id';
const currentTenantId = ref('');
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

export function createUseTenant(options: UseTenantOptions) {
  const { tenantApi, isApiSuccess } = options;

  // Initialize from localStorage on creation
  currentTenantId.value = localStorage.getItem(STORAGE_KEY) ?? '';

  function setCurrentTenant(tenantId: string, tenantName?: string) {
    localStorage.setItem(STORAGE_KEY, tenantId);
    currentTenantId.value = tenantId;
    currentTenantName.value = tenantName ?? tenantId;
  }

  async function loadTenantOptions() {
    try {
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
    } catch (e) {
      console.warn('[tenant] loadTenantOptions failed', e);
      tenantOptions.value = [];
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
      if (isApiSuccess(response) && response.data) {
        const { tenantName, tenantId } = response.data;
        currentTenantName.value = tenantName ?? tenantId;
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
