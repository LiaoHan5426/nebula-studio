/**
 * @nebula-studio/contracts/integration — 租户上下文
 */

export interface TenantContext {
  allowedConnectors: string[];
  tenantId: string;
  tenantName: string;
}
