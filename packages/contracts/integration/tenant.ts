/**
 * @nebula-studio/contracts/integration — 租户上下文
 */

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  allowedConnectors: string[];
}
