export type GovernanceTab = 'rateLimit' | 'circuitBreaker' | 'whitelist';

export interface RuleRow {
  ruleId: string;
  ruleName: string;
  tenantId: string;
  interfaceId: string;
  maxRequests: number;
  windowSeconds: number;
  status: string;
  canManage: boolean;
}

export interface CircuitBreakerRow {
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

export interface WhitelistRow {
  ruleId: string;
  ruleName: string;
  tenantId: string;
  interfaceId: string;
  whitelistIps: string[];
  status: string;
  canManage: boolean;
}

export interface RateLimitForm {
  ruleName: string;
  interfaceId: string;
  maxRequests: string;
  windowSeconds: string;
}

export interface CircuitForm {
  interfaceId: string;
  failureRateThreshold: string;
  slowCallRateThreshold: string;
  slowCallDurationSeconds: string;
  minimumNumberOfCalls: string;
  waitDurationSeconds: string;
}

export interface WhitelistForm {
  ruleName: string;
  interfaceId: string;
  whitelistIps: string;
}

export const TAB_LABELS: Record<GovernanceTab, string> = {
  rateLimit: '限流',
  circuitBreaker: '熔断',
  whitelist: '白名单',
};
