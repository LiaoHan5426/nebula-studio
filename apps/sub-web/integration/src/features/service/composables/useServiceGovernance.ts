import type {
  CircuitBreakerRow,
  CircuitForm,
  GovernanceTab,
  RateLimitForm,
  RuleRow,
  WhitelistForm,
  WhitelistRow,
} from '../governance/types';

import { computed, ref, watch } from 'vue';

import { governanceApi } from '@/features/governance/api';
import {
  governanceCircuitQueryOptions,
  governanceRateLimitQueryOptions,
  governanceWhitelistQueryOptions,
} from '@/features/governance/queryOptions';
import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { tenantsQueryOptions } from '@/features/tenant/queryOptions';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import { useQuery } from '@tanstack/vue-query';

import {
  mapCircuitBreakerRow,
  mapRateLimitRow,
  mapWhitelistRow,
} from '../governance/mappers';
import { TAB_LABELS } from '../governance/types';

export function useServiceGovernance() {
  const activeTab = ref<GovernanceTab>('rateLimit');
  const selectedTenantId = ref('');
  const showDialog = ref(false);
  const editingRule = ref<null | RuleRow>(null);
  const editingCircuit = ref<CircuitBreakerRow | null>(null);
  const editingWhitelist = ref<null | WhitelistRow>(null);

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

  const tenantsQuery = useQuery(() =>
    tenantsQueryOptions(isPlatformAdmin.value),
  );
  const interfacesQuery = useQuery(() =>
    interfacesQueryOptions('governance', { pageSize: 200 }),
  );
  const rateLimitQuery = useQuery(() =>
    governanceRateLimitQueryOptions(
      selectedTenantId.value,
      activeTab.value === 'rateLimit',
    ),
  );
  const circuitQuery = useQuery(() =>
    governanceCircuitQueryOptions(
      selectedTenantId.value,
      activeTab.value === 'circuitBreaker',
    ),
  );
  const whitelistQuery = useQuery(() =>
    governanceWhitelistQueryOptions(
      selectedTenantId.value,
      activeTab.value === 'whitelist',
    ),
  );

  const tenants = computed(() => tenantsQuery.data.value ?? []);
  const tenantOptions = computed(() =>
    tenants.value.map((tenant) => ({
      label: tenant.tenantName,
      value: tenant.tenantId,
    })),
  );
  const services = computed(() => interfacesQuery.data.value?.items ?? []);

  watch(
    tenants,
    (list) => {
      if (!selectedTenantId.value && list[0]) {
        selectedTenantId.value = list[0].tenantId;
      }
    },
    { immediate: true },
  );

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

  const rules = computed(() =>
    (rateLimitQuery.data.value ?? []).map((row) =>
      mapRateLimitRow(
        row as Record<string, unknown>,
        currentTenantId.value,
        canManageInterface,
      ),
    ),
  );
  const circuitBreakers = computed(() =>
    (circuitQuery.data.value ?? []).map((row) =>
      mapCircuitBreakerRow(
        row as Record<string, unknown>,
        currentTenantId.value,
        canManageInterface,
      ),
    ),
  );
  const whitelistRules = computed(() =>
    (whitelistQuery.data.value ?? []).map((row) =>
      mapWhitelistRow(
        row as Record<string, unknown>,
        currentTenantId.value,
        canManageInterface,
        isPlatformAdmin.value,
      ),
    ),
  );
  const loading = computed(() => {
    if (activeTab.value === 'rateLimit') return rateLimitQuery.isPending.value;
    if (activeTab.value === 'circuitBreaker')
      return circuitQuery.isPending.value;
    return whitelistQuery.isPending.value;
  });

  async function loadCurrentTab() {
    if (activeTab.value === 'rateLimit') await rateLimitQuery.refetch();
    else if (activeTab.value === 'circuitBreaker') await circuitQuery.refetch();
    else await whitelistQuery.refetch();
  }

  async function loadRules() {
    await rateLimitQuery.refetch();
  }

  async function loadCircuitBreakers() {
    await circuitQuery.refetch();
  }

  async function loadWhitelistRules() {
    await whitelistQuery.refetch();
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
    tenantOptions,
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
