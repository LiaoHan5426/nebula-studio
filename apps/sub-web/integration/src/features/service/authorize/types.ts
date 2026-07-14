import type { GrantScheduleType } from '@/shared/grant/schedule';
import type { InterfaceGrantRecord } from '@/features/tenant/api';

export interface AuthorizeRow {
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

export interface GrantForm {
  expiresAt: string;
  maxCalls: string;
  rateLimitMax: string;
  rateLimitWindowSeconds: string;
  scheduleType: GrantScheduleType;
  scheduleStartTime: string;
  scheduleEndTime: string;
  enableTimeWindow: boolean;
}

export const DEFAULT_GRANT_FORM: GrantForm = {
  expiresAt: '',
  maxCalls: '',
  rateLimitMax: '',
  rateLimitWindowSeconds: '60',
  scheduleType: 'ALWAYS',
  scheduleStartTime: '',
  scheduleEndTime: '',
  enableTimeWindow: false,
};
