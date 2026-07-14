import { computed, onMounted, ref, watch } from 'vue';

import { governanceApi } from '@/features/governance/api';
import { tenantApi } from '@/features/tenant/api';
import type { TenantRecord } from '@/features/tenant/api';
import { interfaceApi } from '@/shared/api/integration';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import type { ApiInterface } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

import {
  mapCircuitBreakerRow,
  mapRateLimitRow,
  mapWhitelistRow,
} from '../governance/mappers';
import type {
  CircuitBreakerRow,
  CircuitForm,
  GovernanceTab,
  RateLimitForm,
  RuleRow,
  WhitelistForm,
  WhitelistRow,
} from '../governance/types';
import { TAB_LABELS } from '../governance/types';

export function useServiceGovernance() {
  const activeTab = ref<GovernanceTab>('rateLimit');
  const rules = ref<RuleRow[]>([]);
  const circuitBreakers = ref<CircuitBreakerRow[]>([]);
  const whitelistRules = ref<WhitelistRow[]>([]);
  const services = ref<ApiInterface[]>([]);
  const tenants = ref<TenantRecord[]>([]);
  const selectedTenantId = ref('');
  const loading = ref(false);
  const showDialog = ref(false);
  const editingRule = ref<RuleRow | null>(null);
  const editingCircuit = ref<CircuitBreakerRow | null>(null);
  const editingWhitelist = ref<WhitelistRow | null>(null);

  const rateLimitForm = ref<RateLimitForm>({
    ruleName: '',
    interfaceId: '',
    maxRequests: '100',
    windowSeconds: '60',
  });

  const circuitForm = ref<CircuitForm>({
    interfaceId: '',
    failureRateThreshold: '50',
    slowCallRateThreshold: '80',
    slowCallDurationSeconds: '30',
    minimumNumberOfCalls: '10',
    waitDurationSeconds: '60',
  });

  const whitelistForm = ref<WhitelistForm>({
    ruleName: '',
    interfaceId: '',
    whitelistIps: '',
  });

  const { isPlatformAdmin } = useAuth();
  const currentTenantId = computed(() => selectedTenantId.value);

  onMounted(async () => {
    await loadTenants();
    await loadServices();
    await loadCurrentTab();
  });

  watch(selectedTenantId, () => {
    void loadCurrentTab();
  });

  watch(activeTab, () => {
    void loadCurrentTab();
  });

  async function loadTenants() {
    if (isPlatformAdmin.value) {
      const response = await tenantApi.list(1, 100);
      if (isApiSuccess(response)) {
        tenants.value = response.data.items ?? [];
      }
    } else {
      const response = await tenantApi.mine();
      if (isApiSuccess(response)) {
        tenants.value = response.data ?? [];
      }
    }
    if (!selectedTenantId.value && tenants.value[0]) {
      selectedTenantId.value = tenants.value[0].tenantId;
    }
  }

  async function loadServices() {
    const response = await interfaceApi.list({ pageSize: 200 });
    if (isApiSuccess(response)) {
      services.value = response.data.items ?? [];
    }
  }

  function canManageInterface(interfaceId: string): boolean {
    if (!interfaceId) return false;
    if (isPlatformAdmin.value) return true;
    const userId = getAuthUserId();
    const svc = services.value.find((s) => s.interfaceId === interfaceId);
    return (
      svc !== undefined &&
      userId !== null &&
      userId !== undefined &&
      svc.createdBy === userId
    );
  }

  async function loadCurrentTab() {
    if (activeTab.value === 'rateLimit') await loadRules();
    else if (activeTab.value === 'circuitBreaker') await loadCircuitBreakers();
    else await loadWhitelistRules();
  }

  async function loadRules() {
    if (!currentTenantId.value) {
      rules.value = [];
      return;
    }
    loading.value = true;
    try {
      const response = await governanceApi.rateLimitList(
        1,
        50,
        currentTenantId.value,
      );
      if (isApiSuccess(response)) {
        rules.value = (response.data.items ?? []).map((row) =>
          mapRateLimitRow(
            row as Record<string, unknown>,
            currentTenantId.value,
            canManageInterface,
          ),
        );
      }
    } finally {
      loading.value = false;
    }
  }

  async function loadCircuitBreakers() {
    if (!currentTenantId.value) {
      circuitBreakers.value = [];
      return;
    }
    loading.value = true;
    try {
      const response = await governanceApi.circuitBreakerList(
        1,
        50,
        currentTenantId.value,
      );
      if (isApiSuccess(response)) {
        circuitBreakers.value = (response.data.items ?? []).map((row) =>
          mapCircuitBreakerRow(
            row as Record<string, unknown>,
            currentTenantId.value,
            canManageInterface,
          ),
        );
      }
    } finally {
      loading.value = false;
    }
  }

  async function loadWhitelistRules() {
    if (!currentTenantId.value) {
      whitelistRules.value = [];
      return;
    }
    loading.value = true;
    try {
      const response = await governanceApi.whitelistList(
        1,
        50,
        currentTenantId.value,
      );
      if (isApiSuccess(response)) {
        whitelistRules.value = (response.data.items ?? []).map((row) =>
          mapWhitelistRow(
            row as Record<string, unknown>,
            currentTenantId.value,
            canManageInterface,
            isPlatformAdmin.value,
          ),
        );
      }
    } finally {
      loading.value = false;
    }
  }

  function defaultInterfaceId() {
    return (
      manageableServices.value[0]?.interfaceId ??
      services.value[0]?.interfaceId ??
      ''
    );
  }

  function openCreate() {
    editingRule.value = null;
    editingCircuit.value = null;
    editingWhitelist.value = null;
    if (activeTab.value === 'rateLimit') {
      rateLimitForm.value = {
        ruleName: '',
        interfaceId: defaultInterfaceId(),
        maxRequests: '100',
        windowSeconds: '60',
      };
    } else if (activeTab.value === 'circuitBreaker') {
      circuitForm.value = {
        interfaceId: defaultInterfaceId(),
        failureRateThreshold: '50',
        slowCallRateThreshold: '80',
        slowCallDurationSeconds: '30',
        minimumNumberOfCalls: '10',
        waitDurationSeconds: '60',
      };
    } else {
      whitelistForm.value = {
        ruleName: '',
        interfaceId: defaultInterfaceId(),
        whitelistIps: '127.0.0.1',
      };
    }
    showDialog.value = true;
  }

  function openEditRateLimit(row: RuleRow) {
    if (!row.canManage) return;
    editingRule.value = row;
    editingCircuit.value = null;
    editingWhitelist.value = null;
    rateLimitForm.value = {
      ruleName: row.ruleName,
      interfaceId: row.interfaceId,
      maxRequests: String(row.maxRequests),
      windowSeconds: String(row.windowSeconds),
    };
    showDialog.value = true;
  }

  function openEditCircuit(row: CircuitBreakerRow) {
    if (!row.canManage) return;
    editingCircuit.value = row;
    editingRule.value = null;
    editingWhitelist.value = null;
    circuitForm.value = {
      interfaceId: row.interfaceId,
      failureRateThreshold: String(row.failureRateThreshold),
      slowCallRateThreshold: String(row.slowCallRateThreshold),
      slowCallDurationSeconds: String(row.slowCallDurationSeconds),
      minimumNumberOfCalls: String(row.minimumNumberOfCalls),
      waitDurationSeconds: String(row.waitDurationSeconds),
    };
    showDialog.value = true;
  }

  function openEditWhitelist(row: WhitelistRow) {
    if (!row.canManage) return;
    editingWhitelist.value = row;
    editingRule.value = null;
    editingCircuit.value = null;
    whitelistForm.value = {
      ruleName: row.ruleName,
      interfaceId: row.interfaceId,
      whitelistIps: row.whitelistIps.join('\n'),
    };
    showDialog.value = true;
  }

  async function submitDialog() {
    if (!currentTenantId.value) return;
    if (activeTab.value === 'rateLimit') {
      await submitRateLimit();
    } else if (activeTab.value === 'circuitBreaker') {
      await submitCircuitBreaker();
    } else {
      await submitWhitelist();
    }
  }

  async function submitRateLimit() {
    if (!rateLimitForm.value.interfaceId) return;
    const body = {
      ruleName: rateLimitForm.value.ruleName || rateLimitForm.value.interfaceId,
      tenantId: currentTenantId.value,
      interfaceId: rateLimitForm.value.interfaceId,
      maxRequests: Number(rateLimitForm.value.maxRequests),
      windowSeconds: Number(rateLimitForm.value.windowSeconds),
      status: 'ACTIVE',
    };
    if (editingRule.value) {
      await governanceApi.rateLimitUpdate(editingRule.value.ruleId, body);
    } else {
      await governanceApi.rateLimitCreate(body);
    }
    showDialog.value = false;
    await loadRules();
  }

  async function submitCircuitBreaker() {
    if (!circuitForm.value.interfaceId) return;
    const body = {
      tenantId: currentTenantId.value,
      interfaceId: circuitForm.value.interfaceId,
      failureRateThreshold: Number(circuitForm.value.failureRateThreshold),
      slowCallRateThreshold: Number(circuitForm.value.slowCallRateThreshold),
      slowCallDurationSeconds: Number(
        circuitForm.value.slowCallDurationSeconds,
      ),
      minimumNumberOfCalls: Number(circuitForm.value.minimumNumberOfCalls),
      waitDurationSeconds: Number(circuitForm.value.waitDurationSeconds),
      status: 'ACTIVE',
    };
    if (editingCircuit.value) {
      await governanceApi.circuitBreakerUpdate(
        editingCircuit.value.interfaceId,
        body,
      );
    } else {
      await governanceApi.circuitBreakerCreate(body);
    }
    showDialog.value = false;
    await loadCircuitBreakers();
  }

  async function submitWhitelist() {
    const ips = whitelistForm.value.whitelistIps
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const body = {
      ruleName:
        whitelistForm.value.ruleName ||
        whitelistForm.value.interfaceId ||
        'IP 白名单',
      tenantId: currentTenantId.value,
      interfaceId: whitelistForm.value.interfaceId || undefined,
      whitelistIps: ips,
      ruleType: 'IP',
      status: 'ACTIVE',
    };
    if (editingWhitelist.value) {
      await governanceApi.whitelistUpdate(editingWhitelist.value.ruleId, body);
    } else {
      await governanceApi.whitelistCreate(body);
    }
    showDialog.value = false;
    await loadWhitelistRules();
  }

  async function handleOfflineRateLimit(row: RuleRow) {
    if (!row.canManage) return;
    await governanceApi.rateLimitUpdate(row.ruleId, { status: 'INACTIVE' });
    await loadRules();
  }

  async function handleOfflineCircuit(row: CircuitBreakerRow) {
    if (!row.canManage) return;
    await governanceApi.circuitBreakerUpdate(row.interfaceId, {
      status: 'INACTIVE',
    });
    await loadCircuitBreakers();
  }

  async function handleOfflineWhitelist(row: WhitelistRow) {
    if (!row.canManage) return;
    await governanceApi.whitelistUpdate(row.ruleId, { status: 'INACTIVE' });
    await loadWhitelistRules();
  }

  const manageableServices = computed(() => {
    if (isPlatformAdmin.value) return services.value;
    const userId = getAuthUserId();
    return services.value.filter((s) => s.createdBy === userId);
  });

  const dialogTitle = computed(() => {
    if (activeTab.value === 'rateLimit') {
      return editingRule.value ? '编辑限流规则' : '新建限流规则';
    }
    if (activeTab.value === 'circuitBreaker') {
      return editingCircuit.value ? '编辑熔断配置' : '新建熔断配置';
    }
    return editingWhitelist.value ? '编辑白名单' : '新建白名单';
  });

  const createButtonLabel = computed(() => {
    if (activeTab.value === 'rateLimit') return '新建限流规则';
    if (activeTab.value === 'circuitBreaker') return '新建熔断配置';
    return '新建白名单';
  });

  return {
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
    tabLabels: TAB_LABELS,
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
  };
}
