/**
 * @nebula-studio/contracts/integration — 租户上下文
 *
 * `LoginResult` / `AuthProfile` 已迁入 `contracts/auth`，此处 re-export 保持兼容。
 */

import type { AuthProfile, IntegrationLoginResult } from '../auth/index.js';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  allowedConnectors: string[];
}

/** @deprecated 使用 contracts/auth 的 IntegrationLoginResult */
export type LoginResult = IntegrationLoginResult;

export type { AuthProfile };
