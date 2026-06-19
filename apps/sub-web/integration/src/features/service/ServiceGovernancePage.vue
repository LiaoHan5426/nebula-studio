<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { governanceApi, tenantApi } from '@/shared/api/consoleApi';
import type { TenantRecord } from '@/shared/api/consoleApi';
import { interfaceApi } from '@/shared/api/integration';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import type { ApiInterface } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

type GovernanceTab = 'rateLimit' | 'circuitBreaker' | 'whitelist';

interface RuleRow {
  ruleId: string;
  ruleName: string;
  tenantId: string;
  interfaceId: string;
  maxRequests: number;
  windowSeconds: number;
  status: string;
  canManage: boolean;
}

interface CircuitBreakerRow {
  interfaceId: string;
  tenantId: string;
  failureRateThreshold: number;
  slowCallRateThreshold: number;
  slowCallDurationSeconds: number;
  minimumNumberOfCalls: number;
  waitDurationSeconds: number;
  status: string;
  canManage: boolean;
}

interface WhitelistRow {
  ruleId: string;
  ruleName: string;
  tenantId: string;
  interfaceId: string;
  whitelistIps: string[];
  status: string;
  canManage: boolean;
}

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

const rateLimitForm = ref({
  ruleName: '',
  interfaceId: '',
  maxRequests: '100',
  windowSeconds: '60',
});

const circuitForm = ref({
  interfaceId: '',
  failureRateThreshold: '50',
  slowCallRateThreshold: '80',
  slowCallDurationSeconds: '30',
  minimumNumberOfCalls: '10',
  waitDurationSeconds: '60',
});

const whitelistForm = ref({
  ruleName: '',
  interfaceId: '',
  whitelistIps: '',
});

const { isPlatformAdmin } = useAuth();

const currentTenantId = computed(() => selectedTenantId.value);

const tabLabels: Record<GovernanceTab, string> = {
  rateLimit: '限流',
  circuitBreaker: '熔断',
  whitelist: '白名单',
};

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
      rules.value = (response.data.items ?? []).map((row) => {
        const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
        return {
          ruleId: String(row.ruleId ?? row.rule_id ?? ''),
          ruleName: String(row.ruleName ?? row.rule_name ?? interfaceId),
          tenantId: String(
            row.tenantId ?? row.tenant_id ?? currentTenantId.value,
          ),
          interfaceId,
          maxRequests: Number(row.maxRequests ?? row.max_requests ?? 0),
          windowSeconds: Number(row.windowSeconds ?? row.window_seconds ?? 60),
          status: String(row.status ?? 'ACTIVE'),
          canManage: canManageInterface(interfaceId),
        };
      });
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
      circuitBreakers.value = (response.data.items ?? []).map((row) => {
        const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
        return {
          interfaceId,
          tenantId: String(
            row.tenantId ?? row.tenant_id ?? currentTenantId.value,
          ),
          failureRateThreshold: Number(
            row.failureRateThreshold ?? row.failure_rate_threshold ?? 50,
          ),
          slowCallRateThreshold: Number(
            row.slowCallRateThreshold ?? row.slow_call_rate_threshold ?? 80,
          ),
          slowCallDurationSeconds: Number(
            row.slowCallDurationSeconds ?? row.slow_call_duration_seconds ?? 30,
          ),
          minimumNumberOfCalls: Number(
            row.minimumNumberOfCalls ?? row.minimum_number_of_calls ?? 10,
          ),
          waitDurationSeconds: Number(
            row.waitDurationSeconds ?? row.wait_duration_seconds ?? 60,
          ),
          status: String(row.status ?? 'ACTIVE'),
          canManage: canManageInterface(interfaceId),
        };
      });
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
      whitelistRules.value = (response.data.items ?? []).map((row) => {
        const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
        const ips = row.whitelistIps ?? row.whitelist_ips;
        return {
          ruleId: String(row.ruleId ?? row.rule_id ?? ''),
          ruleName: String(
            row.ruleName ?? row.rule_name ?? (interfaceId || '全局白名单'),
          ),
          tenantId: String(
            row.tenantId ?? row.tenant_id ?? currentTenantId.value,
          ),
          interfaceId,
          whitelistIps: Array.isArray(ips) ? ips.map(String) : [],
          status: String(row.status ?? 'ACTIVE'),
          canManage: interfaceId
            ? canManageInterface(interfaceId)
            : isPlatformAdmin.value,
        };
      });
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
    slowCallDurationSeconds: Number(circuitForm.value.slowCallDurationSeconds),
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
</script>

<template>
  <div class="service-governance-page">
    <header class="service-governance-page__header">
      <div>
        <h2 class="service-governance-page__title">服务治理</h2>
        <p class="service-governance-page__desc">
          按租户配置限流、熔断与白名单。仅<strong>本人发布</strong>的服务可新建/修改；获权服务为只读。
        </p>
      </div>
      <div v-if="tenants.length" class="service-governance-page__tenant-select">
        <label for="gov-tenant-select">治理租户</label>
        <select id="gov-tenant-select" v-model="selectedTenantId">
          <option v-for="t in tenants" :key="t.tenantId" :value="t.tenantId">
            {{ t.tenantName }} ({{ t.tenantId }})
          </option>
        </select>
      </div>
    </header>

    <div class="service-governance-page__tabs" role="tablist">
      <button
        v-for="(label, key) in tabLabels"
        :key="key"
        type="button"
        role="tab"
        class="service-governance-page__tab"
        :class="{ 'service-governance-page__tab--active': activeTab === key }"
        @click="activeTab = key as GovernanceTab"
      >
        {{ label }}
      </button>
    </div>

    <div class="service-governance-page__actions">
      <NebulaButton variant="secondary" @click="loadCurrentTab"
        >刷新</NebulaButton
      >
      <NebulaButton :disabled="!selectedTenantId" @click="openCreate">
        {{ createButtonLabel }}
      </NebulaButton>
    </div>

    <div v-if="!selectedTenantId" class="service-governance-page__empty">
      请先创建租户后再配置治理规则
    </div>

    <div
      v-else-if="activeTab === 'rateLimit'"
      class="service-governance-page__table-wrap"
    >
      <NebulaTable
        :data="rules"
        :loading="loading"
        :scroll-x="{ enabled: true }"
        row-key="ruleId"
      >
        <NebulaTableColumn field="ruleName" title="规则名称" min-width="140" />
        <NebulaTableColumn
          field="interfaceId"
          title="服务 ID"
          min-width="140"
        />
        <NebulaTableColumn title="限流阈值" width="120">
          <template #default="{ row }">
            {{ row.maxRequests }} / {{ row.windowSeconds }}s
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn field="status" title="状态" width="100">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="160">
          <template #default="{ row }">
            <div class="action-btns">
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage"
                @click="openEditRateLimit(row)"
              >
                配置
              </NebulaButton>
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage || row.status !== 'ACTIVE'"
                @click="handleOfflineRateLimit(row)"
              >
                下线
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div
      v-else-if="activeTab === 'circuitBreaker'"
      class="service-governance-page__table-wrap"
    >
      <NebulaTable
        :data="circuitBreakers"
        :loading="loading"
        :scroll-x="{ enabled: true }"
        row-key="interfaceId"
      >
        <NebulaTableColumn
          field="interfaceId"
          title="服务 ID"
          min-width="140"
        />
        <NebulaTableColumn title="失败率阈值" width="110">
          <template #default="{ row }"
            >{{ row.failureRateThreshold }}%</template
          >
        </NebulaTableColumn>
        <NebulaTableColumn title="慢调用阈值" width="110">
          <template #default="{ row }"
            >{{ row.slowCallRateThreshold }}%</template
          >
        </NebulaTableColumn>
        <NebulaTableColumn title="最小调用数" width="100">
          <template #default="{ row }">{{ row.minimumNumberOfCalls }}</template>
        </NebulaTableColumn>
        <NebulaTableColumn title="熔断等待(s)" width="110">
          <template #default="{ row }">{{ row.waitDurationSeconds }}</template>
        </NebulaTableColumn>
        <NebulaTableColumn field="status" title="状态" width="100">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="160">
          <template #default="{ row }">
            <div class="action-btns">
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage"
                @click="openEditCircuit(row)"
              >
                配置
              </NebulaButton>
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage || row.status !== 'ACTIVE'"
                @click="handleOfflineCircuit(row)"
              >
                下线
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div v-else class="service-governance-page__table-wrap">
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
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="160">
          <template #default="{ row }">
            <div class="action-btns">
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage"
                @click="openEditWhitelist(row)"
              >
                配置
              </NebulaButton>
              <NebulaButton
                variant="secondary"
                :disabled="!row.canManage || row.status !== 'ACTIVE'"
                @click="handleOfflineWhitelist(row)"
              >
                下线
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <div class="modal-card">
        <h3>{{ dialogTitle }}</h3>
        <div v-if="activeTab === 'rateLimit'" class="modal-form">
          <label class="modal-form__field">
            <span>规则名称</span>
            <input v-model="rateLimitForm.ruleName" placeholder="可选" />
          </label>
          <label class="modal-form__field">
            <span>目标服务</span>
            <select v-model="rateLimitForm.interfaceId">
              <option
                v-for="svc in manageableServices"
                :key="svc.interfaceId"
                :value="svc.interfaceId"
              >
                {{ svc.interfaceName }} ({{ svc.interfaceId }})
              </option>
            </select>
          </label>
          <label class="modal-form__field">
            <span>窗口内最大请求数</span>
            <input v-model="rateLimitForm.maxRequests" type="number" min="1" />
          </label>
          <label class="modal-form__field">
            <span>窗口（秒）</span>
            <input
              v-model="rateLimitForm.windowSeconds"
              type="number"
              min="1"
            />
          </label>
        </div>
        <div v-else-if="activeTab === 'circuitBreaker'" class="modal-form">
          <label class="modal-form__field">
            <span>目标服务</span>
            <select
              v-model="circuitForm.interfaceId"
              :disabled="!!editingCircuit"
            >
              <option
                v-for="svc in manageableServices"
                :key="svc.interfaceId"
                :value="svc.interfaceId"
              >
                {{ svc.interfaceName }} ({{ svc.interfaceId }})
              </option>
            </select>
          </label>
          <label class="modal-form__field">
            <span>失败率阈值 (%)</span>
            <input
              v-model="circuitForm.failureRateThreshold"
              type="number"
              min="1"
              max="100"
            />
          </label>
          <label class="modal-form__field">
            <span>慢调用率阈值 (%)</span>
            <input
              v-model="circuitForm.slowCallRateThreshold"
              type="number"
              min="1"
              max="100"
            />
          </label>
          <label class="modal-form__field">
            <span>慢调用时长 (秒)</span>
            <input
              v-model="circuitForm.slowCallDurationSeconds"
              type="number"
              min="1"
            />
          </label>
          <label class="modal-form__field">
            <span>最小调用次数</span>
            <input
              v-model="circuitForm.minimumNumberOfCalls"
              type="number"
              min="1"
            />
          </label>
          <label class="modal-form__field">
            <span>熔断等待 (秒)</span>
            <input
              v-model="circuitForm.waitDurationSeconds"
              type="number"
              min="1"
            />
          </label>
        </div>
        <div v-else class="modal-form">
          <label class="modal-form__field">
            <span>规则名称</span>
            <input v-model="whitelistForm.ruleName" placeholder="可选" />
          </label>
          <label class="modal-form__field">
            <span>目标服务（留空为租户级）</span>
            <select v-model="whitelistForm.interfaceId">
              <option value="">（租户级）</option>
              <option
                v-for="svc in manageableServices"
                :key="svc.interfaceId"
                :value="svc.interfaceId"
              >
                {{ svc.interfaceName }} ({{ svc.interfaceId }})
              </option>
            </select>
          </label>
          <label class="modal-form__field">
            <span>允许 IP（每行或逗号分隔）</span>
            <textarea v-model="whitelistForm.whitelistIps" rows="4" />
          </label>
        </div>
        <div class="modal-card__actions">
          <NebulaButton variant="secondary" @click="showDialog = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="submitDialog">保存</NebulaButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-governance-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.service-governance-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-governance-page__tabs {
  display: flex;
  gap: 4px;
}

.service-governance-page__tab {
  padding: 8px 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.service-governance-page__tab--active {
  color: hsl(var(--foreground));
  background: hsl(var(--accent));
  border-color: hsl(var(--primary));
}

.service-governance-page__tenant-select {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.service-governance-page__tenant-select select {
  min-width: 220px;
  padding: 6px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.service-governance-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-governance-page__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.service-governance-page__actions {
  display: flex;
  gap: 8px;
}

.service-governance-page__empty {
  padding: 40px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-governance-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.action-btns {
  display: inline-flex;
  gap: 6px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal-card {
  width: min(480px, calc(100vw - 32px));
  padding: 20px 24px;
  background: hsl(var(--card));
  border-radius: 10px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.modal-form__field input,
.modal-form__field select,
.modal-form__field textarea {
  padding: 8px 10px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.modal-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
