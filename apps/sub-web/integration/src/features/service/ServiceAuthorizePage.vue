<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  NebulaButton,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import {
  GRANT_SCHEDULE_OPTIONS,
  formatGrantScheduleLabel,
  isOutsideGrantSchedule,
} from '@/shared/grant/schedule';
import type { GrantScheduleType } from '@/shared/grant/schedule';
import type {
  AuthorizeInterfaceOptions,
  InterfaceGrantRecord,
  TenantRecord,
} from '@/shared/api/consoleApi';
import { tenantApi } from '@/shared/api/consoleApi';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import { interfaceApi } from '@/shared/api/integration';
import type { ApiInterface } from '@/shared/types';
import { InterfaceStatus, InterfaceType, isApiSuccess } from '@/shared/types';

interface AuthorizeRow {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  endpointUri: string;
  publishStatus: string;
  serviceSource: string;
  tenantAuthorized: boolean;
  wildcardAccess: boolean;
  grant?: InterfaceGrantRecord;
  expiresLabel: string;
  callsLabel: string;
  rateLabel: string;
  scheduleLabel: string;
  grantExpired: boolean;
  grantOutsideSchedule: boolean;
}

const route = useRoute();
const { isPlatformAdmin } = useAuth();
const services = ref<ApiInterface[]>([]);
const tenants = ref<TenantRecord[]>([]);
const selectedTenant = ref<TenantRecord | null>(null);
const selectedTenantId = ref('');
const loading = ref(false);
const actingId = ref<string | null>(null);
const showGrantDialog = ref(false);
const grantTarget = ref<AuthorizeRow | null>(null);
const grantForm = ref({
  expiresAt: '',
  maxCalls: '',
  rateLimitMax: '',
  rateLimitWindowSeconds: '60',
  scheduleType: 'ALWAYS' as GrantScheduleType,
  scheduleStartTime: '',
  scheduleEndTime: '',
  enableTimeWindow: false,
});

const grantMap = computed(() => {
  const map = new Map<string, InterfaceGrantRecord>();
  for (const grant of selectedTenant.value?.interfaceGrants ?? []) {
    if (grant.status === 'ACTIVE') {
      map.set(grant.interfaceId, grant);
    }
  }
  return map;
});

const allowedSet = computed(() => {
  const allowed = selectedTenant.value?.allowedInterfaces;
  if (!allowed || allowed.length === 0) return new Set<string>();
  if (allowed.includes('*')) return null;
  return new Set(allowed);
});

const wildcardAccess = computed(
  () => selectedTenant.value?.allowedInterfaces?.includes('*') ?? false,
);

function formatExpires(grant?: InterfaceGrantRecord) {
  if (!grant?.expiresAt) return '不限';
  const date = new Date(grant.expiresAt);
  if (Number.isNaN(date.getTime())) return grant.expiresAt;
  return date.toLocaleString();
}

function isGrantExpired(grant?: InterfaceGrantRecord) {
  if (!grant?.expiresAt) return false;
  const date = new Date(grant.expiresAt);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

function formatCalls(grant?: InterfaceGrantRecord) {
  if (!grant) return '-';
  const used = grant.callCount ?? 0;
  if (grant.maxCalls === undefined || grant.maxCalls === null)
    return `${used} / 不限`;
  return `${used} / ${grant.maxCalls}`;
}

function formatRate(grant?: InterfaceGrantRecord) {
  if (!grant?.rateLimitMax) return '不限';
  const window = grant.rateLimitWindowSeconds ?? 60;
  return `${grant.rateLimitMax} 次 / ${window}s`;
}

const authorizeRows = computed<AuthorizeRow[]>(() => {
  const currentUserId = getAuthUserId();
  return services.value.map((intf) => {
    const wildcard = wildcardAccess.value;
    const set = allowedSet.value;
    const grant = grantMap.value.get(intf.interfaceId);
    const tenantAuthorized =
      wildcard || (set !== null && set.has(intf.interfaceId));
    const isOwn =
      currentUserId !== null &&
      currentUserId !== undefined &&
      intf.createdBy === currentUserId;
    return {
      serviceId: intf.interfaceId,
      serviceName: intf.interfaceName,
      serviceType:
        intf.interfaceType === InterfaceType.COMPOSITE
          ? '组合服务'
          : '原子服务',
      endpointUri: intf.endpointUri,
      publishStatus: intf.status,
      serviceSource: isOwn ? '本人发布' : '已获授权',
      tenantAuthorized,
      wildcardAccess: wildcard,
      grant,
      expiresLabel: tenantAuthorized && grant ? formatExpires(grant) : '-',
      callsLabel: tenantAuthorized && grant ? formatCalls(grant) : '-',
      rateLabel: tenantAuthorized && grant ? formatRate(grant) : '-',
      scheduleLabel:
        tenantAuthorized && grant
          ? formatGrantScheduleLabel(
              grant.scheduleType,
              grant.scheduleStartTime,
              grant.scheduleEndTime,
              grant.scheduleLabel,
            )
          : '-',
      grantExpired: tenantAuthorized && isGrantExpired(grant),
      grantOutsideSchedule:
        tenantAuthorized &&
        isOutsideGrantSchedule(
          grant?.scheduleType,
          grant?.scheduleStartTime,
          grant?.scheduleEndTime,
          grant?.scheduleTimezone ?? 'Asia/Shanghai',
        ),
    };
  });
});

onMounted(async () => {
  await loadTenants();
  const queryTenantId =
    typeof route.query.tenantId === 'string' ? route.query.tenantId : '';
  if (queryTenantId) {
    selectedTenantId.value = queryTenantId;
  }
  await loadServices();
});

watch(selectedTenantId, async (tenantId) => {
  if (tenantId) {
    await loadSelectedTenant(tenantId);
  }
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
    await loadSelectedTenant(selectedTenantId.value);
  }
}

async function loadSelectedTenant(tenantId: string) {
  const response = await tenantApi.get(tenantId);
  if (isApiSuccess(response)) {
    selectedTenant.value = response.data;
  }
}

async function loadServices() {
  loading.value = true;
  try {
    const response = await interfaceApi.list({
      pageSize: 100,
      scope: isPlatformAdmin.value ? undefined : 'authorizable',
    });
    if (isApiSuccess(response)) {
      services.value = response.data.items ?? [];
    }
  } finally {
    loading.value = false;
  }
}

async function refreshAll() {
  loading.value = true;
  try {
    await Promise.all([
      loadServices(),
      selectedTenantId.value
        ? loadSelectedTenant(selectedTenantId.value)
        : Promise.resolve(),
    ]);
  } finally {
    loading.value = false;
  }
}

function toIsoExpires(localValue: string): string | undefined {
  if (!localValue.trim()) return undefined;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function buildGrantOptions(): AuthorizeInterfaceOptions {
  const options: AuthorizeInterfaceOptions = {};
  const expiresAt = toIsoExpires(grantForm.value.expiresAt);
  if (expiresAt) options.expiresAt = expiresAt;
  if (grantForm.value.maxCalls.trim()) {
    options.maxCalls = Number(grantForm.value.maxCalls);
  }
  if (grantForm.value.rateLimitMax.trim()) {
    options.rateLimitMax = Number(grantForm.value.rateLimitMax);
  }
  if (grantForm.value.rateLimitWindowSeconds.trim()) {
    options.rateLimitWindowSeconds = Number(
      grantForm.value.rateLimitWindowSeconds,
    );
  }
  options.scheduleType = grantForm.value.scheduleType;
  if (grantForm.value.scheduleType !== 'ALWAYS') {
    if (grantForm.value.enableTimeWindow) {
      if (grantForm.value.scheduleStartTime) {
        options.scheduleStartTime = grantForm.value.scheduleStartTime;
      }
      if (grantForm.value.scheduleEndTime) {
        options.scheduleEndTime = grantForm.value.scheduleEndTime;
      }
    } else {
      options.scheduleStartTime = null;
      options.scheduleEndTime = null;
    }
    options.scheduleTimezone = 'Asia/Shanghai';
  }
  return options;
}

function resetGrantForm(row?: AuthorizeRow) {
  const grant = row?.grant;
  let expiresAt = '';
  if (grant?.expiresAt) {
    const d = new Date(grant.expiresAt);
    if (!Number.isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      expiresAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  grantForm.value = {
    expiresAt,
    maxCalls:
      grant?.maxCalls !== undefined && grant?.maxCalls !== null
        ? String(grant.maxCalls)
        : '',
    rateLimitMax:
      grant?.rateLimitMax !== undefined && grant?.rateLimitMax !== null
        ? String(grant.rateLimitMax)
        : '',
    rateLimitWindowSeconds:
      grant?.rateLimitWindowSeconds !== undefined &&
      grant?.rateLimitWindowSeconds !== null
        ? String(grant.rateLimitWindowSeconds)
        : '60',
    scheduleType: (grant?.scheduleType as GrantScheduleType) ?? 'ALWAYS',
    scheduleStartTime: grant?.scheduleStartTime ?? '',
    scheduleEndTime: grant?.scheduleEndTime ?? '',
    enableTimeWindow: Boolean(
      grant?.scheduleStartTime && grant?.scheduleEndTime,
    ),
  };
}

function openGrantDialog(row: AuthorizeRow) {
  grantTarget.value = row;
  resetGrantForm(row);
  showGrantDialog.value = true;
}

function closeGrantDialog() {
  showGrantDialog.value = false;
  grantTarget.value = null;
}

async function submitGrant() {
  if (!selectedTenantId.value || !grantTarget.value) return;
  actingId.value = grantTarget.value.serviceId;
  try {
    await tenantApi.authorizeInterface(
      selectedTenantId.value,
      [grantTarget.value.serviceId],
      buildGrantOptions(),
    );
    await loadSelectedTenant(selectedTenantId.value);
    closeGrantDialog();
  } finally {
    actingId.value = null;
  }
}

async function handleRevoke(row: AuthorizeRow) {
  if (!selectedTenantId.value || row.wildcardAccess) return;
  actingId.value = row.serviceId;
  try {
    await tenantApi.revokeInterface(selectedTenantId.value, row.serviceId);
    await loadSelectedTenant(selectedTenantId.value);
  } finally {
    actingId.value = null;
  }
}

function publishVariant(status: string) {
  if (status === InterfaceStatus.ACTIVE) return 'success';
  if (status === InterfaceStatus.DRAFT) return 'warning';
  return 'default';
}

function formatAllowedSummary() {
  if (!selectedTenant.value) return '-';
  const allowed = selectedTenant.value.allowedInterfaces;
  if (!allowed || allowed.length === 0) return '未授权任何服务';
  if (allowed.includes('*')) return '全部服务（*）';
  const grants = selectedTenant.value.interfaceGrants?.filter(
    (g) => g.status === 'ACTIVE',
  );
  return `已授权 ${allowed.length} 项${grants?.length ? `，含 ${grants.length} 条配额策略` : ''}`;
}
</script>

<template>
  <div class="service-authorize-page">
    <header class="service-authorize-page__header">
      <div>
        <h2 class="service-authorize-page__title">服务授权</h2>
        <p class="service-authorize-page__desc">
          为对接租户授予服务调用权限，并可配置<strong>有效期</strong>、<strong>服务时间段</strong>、<strong>总调用次数</strong>与<strong>调用频率</strong>。
          网关会在鉴权时校验上述策略。
        </p>
      </div>
      <div class="service-authorize-page__tenant-select">
        <label for="tenant-select">授权目标租户</label>
        <select id="tenant-select" v-model="selectedTenantId">
          <option v-for="t in tenants" :key="t.tenantId" :value="t.tenantId">
            {{ t.tenantName }} ({{ t.tenantId }})
          </option>
        </select>
        <p v-if="selectedTenant" class="service-authorize-page__tenant-summary">
          {{ formatAllowedSummary() }}
        </p>
      </div>
    </header>

    <div class="service-authorize-page__actions">
      <NebulaButton variant="secondary" @click="refreshAll">刷新</NebulaButton>
    </div>

    <div v-if="!selectedTenantId" class="service-authorize-page__empty">
      请先创建租户后再进行服务授权
    </div>

    <div v-else class="service-authorize-page__table-wrap">
      <NebulaTable
        :data="authorizeRows"
        :loading="loading"
        :scroll-x="{ enabled: true }"
        row-key="serviceId"
        class="service-authorize-page__table"
      >
        <NebulaTableColumn
          field="serviceName"
          title="服务名称"
          min-width="120"
          show-overflow="tooltip"
        />
        <NebulaTableColumn field="serviceType" title="类型" width="90" />
        <NebulaTableColumn field="serviceSource" title="来源" width="90" />
        <NebulaTableColumn field="publishStatus" title="发布状态" width="100">
          <template #default="{ row }">
            <NebulaTag :variant="publishVariant(row.publishStatus)">
              {{ row.publishStatus }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="租户授权" width="100">
          <template #default="{ row }">
            <NebulaTag
              :variant="
                row.grantExpired || row.grantOutsideSchedule
                  ? 'warning'
                  : row.tenantAuthorized
                    ? 'success'
                    : 'default'
              "
            >
              {{
                row.wildcardAccess
                  ? '全部'
                  : row.grantExpired
                    ? '已过期'
                    : row.grantOutsideSchedule
                      ? '时段外'
                      : row.tenantAuthorized
                        ? '已授权'
                        : '未授权'
              }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn field="expiresLabel" title="有效期" width="140" />
        <NebulaTableColumn
          field="scheduleLabel"
          title="服务时间"
          min-width="150"
        />
        <NebulaTableColumn field="callsLabel" title="调用次数" width="100" />
        <NebulaTableColumn field="rateLabel" title="调用频率" width="120" />
        <NebulaTableColumn title="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <NebulaButton
                v-if="!row.wildcardAccess"
                variant="secondary"
                :disabled="actingId === row.serviceId"
                @click="openGrantDialog(row)"
              >
                {{ row.tenantAuthorized ? '调整配额' : '授权' }}
              </NebulaButton>
              <NebulaButton
                v-if="row.tenantAuthorized && !row.wildcardAccess"
                variant="secondary"
                :disabled="actingId === row.serviceId"
                @click="handleRevoke(row)"
              >
                撤销
              </NebulaButton>
              <span v-if="row.wildcardAccess" class="action-btns__hint"
                >通配 *</span
              >
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div
      v-if="showGrantDialog && grantTarget"
      class="modal-overlay"
      @click.self="closeGrantDialog"
    >
      <div class="modal-card">
        <h3 class="modal-card__title">
          {{ grantTarget.tenantAuthorized ? '调整授权配额' : '服务授权' }}
        </h3>
        <p class="modal-card__subtitle">
          {{ grantTarget.serviceName }}（{{ grantTarget.serviceId }}）
        </p>
        <div class="modal-form">
          <label class="modal-form__field">
            <span>有效期（可选）</span>
            <input v-model="grantForm.expiresAt" type="datetime-local" />
          </label>
          <label class="modal-form__field">
            <span>服务时间段</span>
            <select v-model="grantForm.scheduleType">
              <option
                v-for="opt in GRANT_SCHEDULE_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </label>
          <label
            v-if="grantForm.scheduleType !== 'ALWAYS'"
            class="modal-form__field modal-form__field--inline"
          >
            <input v-model="grantForm.enableTimeWindow" type="checkbox" />
            <span>限制日内时段（如 08:00-20:00）</span>
          </label>
          <div
            v-if="
              grantForm.scheduleType !== 'ALWAYS' && grantForm.enableTimeWindow
            "
            class="modal-form__row"
          >
            <label class="modal-form__field">
              <span>开始时间</span>
              <input v-model="grantForm.scheduleStartTime" type="time" />
            </label>
            <label class="modal-form__field">
              <span>结束时间</span>
              <input v-model="grantForm.scheduleEndTime" type="time" />
            </label>
          </div>
          <label class="modal-form__field">
            <span>总调用次数（可选，留空不限）</span>
            <input
              v-model="grantForm.maxCalls"
              type="number"
              min="1"
              placeholder="例如 10000"
            />
          </label>
          <label class="modal-form__field">
            <span>调用频率 - 窗口内最大次数（可选）</span>
            <input
              v-model="grantForm.rateLimitMax"
              type="number"
              min="1"
              placeholder="例如 100"
            />
          </label>
          <label class="modal-form__field">
            <span>频率窗口（秒）</span>
            <input
              v-model="grantForm.rateLimitWindowSeconds"
              type="number"
              min="1"
              placeholder="60"
            />
          </label>
        </div>
        <div class="modal-card__actions">
          <NebulaButton variant="secondary" @click="closeGrantDialog">
            取消
          </NebulaButton>
          <NebulaButton
            :disabled="actingId === grantTarget.serviceId"
            @click="submitGrant"
          >
            确认
          </NebulaButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service-authorize-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.service-authorize-page__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-authorize-page__tenant-select {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.service-authorize-page__tenant-select select {
  min-width: 220px;
  padding: 6px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.service-authorize-page__tenant-summary {
  margin: 4px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.service-authorize-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-authorize-page__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.service-authorize-page__actions {
  display: flex;
  gap: 8px;
}

.service-authorize-page__empty {
  padding: 40px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-authorize-page__table-wrap {
  padding: 12px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-authorize-page__table {
  width: 100%;
}

.action-btns {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.action-btns__hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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
  width: min(440px, calc(100vw - 32px));
  padding: 20px 24px;
  background: hsl(var(--card));
  border-radius: 10px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
}

.modal-card__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
}

.modal-card__subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.modal-form__field input,
.modal-form__field select {
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.modal-form__field--inline {
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.modal-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
