import {
  formatGrantScheduleLabel,
  isOutsideGrantSchedule,
} from '@/shared/grant/schedule';
import type { GrantScheduleType } from '@/shared/grant/schedule';
import type {
  AuthorizeInterfaceOptions,
  InterfaceGrantRecord,
  TenantRecord,
} from '@/features/tenant/api';
import type { ApiInterface } from '@/shared/types';
import { InterfaceStatus, InterfaceType } from '@/shared/types';

import type { AuthorizeRow, GrantForm } from './types';
import { DEFAULT_GRANT_FORM } from './types';

export function formatExpires(grant?: InterfaceGrantRecord) {
  if (!grant?.expiresAt) return '不限';
  const date = new Date(grant.expiresAt);
  if (Number.isNaN(date.getTime())) return grant.expiresAt;
  return date.toLocaleString();
}

export function isGrantExpired(grant?: InterfaceGrantRecord) {
  if (!grant?.expiresAt) return false;
  const date = new Date(grant.expiresAt);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

export function formatCalls(grant?: InterfaceGrantRecord) {
  if (!grant) return '-';
  const used = grant.callCount ?? 0;
  if (grant.maxCalls === undefined || grant.maxCalls === null) {
    return `${used} / 不限`;
  }
  return `${used} / ${grant.maxCalls}`;
}

export function formatRate(grant?: InterfaceGrantRecord) {
  if (!grant?.rateLimitMax) return '不限';
  const window = grant.rateLimitWindowSeconds ?? 60;
  return `${grant.rateLimitMax} 次 / ${window}s`;
}

export function publishVariant(status: string) {
  if (status === InterfaceStatus.ACTIVE) return 'success';
  if (status === InterfaceStatus.DRAFT) return 'warning';
  return 'default';
}

export function formatAllowedSummary(tenant: TenantRecord | null) {
  if (!tenant) return '-';
  const allowed = tenant.allowedInterfaces;
  if (!allowed || allowed.length === 0) return '未授权任何服务';
  if (allowed.includes('*')) return '全部服务（*）';
  const grants = tenant.interfaceGrants?.filter((g) => g.status === 'ACTIVE');
  return `已授权 ${allowed.length} 项${grants?.length ? `，含 ${grants.length} 条配额策略` : ''}`;
}

function toIsoExpires(localValue: string): string | undefined {
  if (!localValue.trim()) return undefined;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function buildGrantOptions(form: GrantForm): AuthorizeInterfaceOptions {
  const options: AuthorizeInterfaceOptions = {};
  const expiresAt = toIsoExpires(form.expiresAt);
  if (expiresAt) options.expiresAt = expiresAt;
  if (form.maxCalls.trim()) {
    options.maxCalls = Number(form.maxCalls);
  }
  if (form.rateLimitMax.trim()) {
    options.rateLimitMax = Number(form.rateLimitMax);
  }
  if (form.rateLimitWindowSeconds.trim()) {
    options.rateLimitWindowSeconds = Number(form.rateLimitWindowSeconds);
  }
  options.scheduleType = form.scheduleType;
  if (form.scheduleType !== 'ALWAYS') {
    if (form.enableTimeWindow) {
      if (form.scheduleStartTime) {
        options.scheduleStartTime = form.scheduleStartTime;
      }
      if (form.scheduleEndTime) {
        options.scheduleEndTime = form.scheduleEndTime;
      }
    } else {
      options.scheduleStartTime = null;
      options.scheduleEndTime = null;
    }
    options.scheduleTimezone = 'Asia/Shanghai';
  }
  return options;
}

export function grantFormFromRow(row?: AuthorizeRow): GrantForm {
  const grant = row?.grant;
  let expiresAt = '';
  if (grant?.expiresAt) {
    const d = new Date(grant.expiresAt);
    if (!Number.isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      expiresAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  return {
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

export function mapAuthorizeRow(
  intf: ApiInterface,
  context: {
    wildcard: boolean;
    allowedSet: Set<string> | null;
    grant?: InterfaceGrantRecord;
    currentUserId: string | null | undefined;
  },
): AuthorizeRow {
  const { wildcard, allowedSet, grant, currentUserId } = context;
  const tenantAuthorized =
    wildcard || (allowedSet !== null && allowedSet.has(intf.interfaceId));
  const isOwn =
    currentUserId !== null &&
    currentUserId !== undefined &&
    intf.createdBy === currentUserId;

  return {
    serviceId: intf.interfaceId,
    serviceName: intf.interfaceName,
    serviceType:
      intf.interfaceType === InterfaceType.COMPOSITE ? '组合服务' : '原子服务',
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
}

export function createEmptyGrantForm(): GrantForm {
  return { ...DEFAULT_GRANT_FORM };
}
