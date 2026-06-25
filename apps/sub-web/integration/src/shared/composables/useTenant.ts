/**
 * Tenant composable — delegates to `@nebula-studio/tenant`.
 *
 * This file re-exports the core composable factory bound to integration-app
 * API adapters so existing `@/shared/composables/useTenant` imports continue
 * to work unchanged.
 */
import { createUseTenant } from '@nebula-studio/tenant';
import type { TenantRecord } from '@nebula-studio/tenant';

import { tenantApi } from '@/shared/api/consoleApi';
import { isApiSuccess } from '@/shared/types';

export type { TenantRecord };

const useTenantCore = createUseTenant({
  tenantApi: tenantApi as Parameters<typeof createUseTenant>[0]['tenantApi'],
  isApiSuccess,
});

export const useTenant = useTenantCore;
