/**
 * @deprecated Import domain APIs from @/features/<domain>/api directly.
 * Scheduled for removal after migration wave 2.
 */
export { approvalApi } from '@/features/approval/api';
export {
  governanceApi,
  resourceApi,
  governancePolicyApi,
} from '@/features/governance/api';
export { monitorApi, dagApi } from '@/features/monitor/api';
export { pluginApi, pluginCatalogApi } from '@/features/plugin/api';
export { releaseApi } from '@/features/release/api';
export {
  subscriptionApi,
  subscriptionRequestApi,
} from '@/features/subscription/api';
export { tenantApi } from '@/features/tenant/api';
export type {
  AuthorizeInterfaceOptions,
  InterfaceGrantRecord,
  TenantRecord,
} from '@/features/tenant/api';
export type { PluginRecord } from '@/features/plugin/api';
export type { SubscriptionRequestRecord } from '@/features/subscription/api';
export { versionApi } from '@/features/version/api';
