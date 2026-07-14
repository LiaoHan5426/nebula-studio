import type { CircuitBreakerRow, RuleRow, WhitelistRow } from './types';

export function mapRateLimitRow(
  row: Record<string, unknown>,
  tenantId: string,
  canManage: (interfaceId: string) => boolean,
): RuleRow {
  const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
  return {
    ruleId: String(row.ruleId ?? row.rule_id ?? ''),
    ruleName: String(row.ruleName ?? row.rule_name ?? interfaceId),
    tenantId: String(row.tenantId ?? row.tenant_id ?? tenantId),
    interfaceId,
    maxRequests: Number(row.maxRequests ?? row.max_requests ?? 0),
    windowSeconds: Number(row.windowSeconds ?? row.window_seconds ?? 60),
    status: String(row.status ?? 'ACTIVE'),
    canManage: canManage(interfaceId),
  };
}

export function mapCircuitBreakerRow(
  row: Record<string, unknown>,
  tenantId: string,
  canManage: (interfaceId: string) => boolean,
): CircuitBreakerRow {
  const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
  return {
    interfaceId,
    tenantId: String(row.tenantId ?? row.tenant_id ?? tenantId),
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
    canManage: canManage(interfaceId),
  };
}

export function mapWhitelistRow(
  row: Record<string, unknown>,
  tenantId: string,
  canManage: (interfaceId: string) => boolean,
  isPlatformAdmin: boolean,
): WhitelistRow {
  const interfaceId = String(row.interfaceId ?? row.interface_id ?? '');
  const ips = row.whitelistIps ?? row.whitelist_ips;
  return {
    ruleId: String(row.ruleId ?? row.rule_id ?? ''),
    ruleName: String(
      row.ruleName ?? row.rule_name ?? (interfaceId || '全局白名单'),
    ),
    tenantId: String(row.tenantId ?? row.tenant_id ?? tenantId),
    interfaceId,
    whitelistIps: Array.isArray(ips) ? ips.map(String) : [],
    status: String(row.status ?? 'ACTIVE'),
    canManage: interfaceId ? canManage(interfaceId) : isPlatformAdmin,
  };
}
