/**
 * Tenant composable — delegates to `@nebula-studio/tenant`.
 *
 * This file re-exports the core composable factory bound to integration-app
 * API adapters so existing `@/shared/composables/useTenant` imports continue
 * to work unchanged.
 */
import { createUseTenant } from '@nebula-studio/tenant';
import type {
  ApiResponse as TenantApiResponse,
  TenantRecord,
} from '@nebula-studio/tenant';

import { tenantApi } from '@/features/tenant/api';
import { isApiSuccess } from '@/shared/types';

export type { TenantRecord };

const useTenantCore = createUseTenant({
  tenantApi: tenantApi as unknown as Parameters<
    typeof createUseTenant
  >[0]['tenantApi'],
  isApiSuccess: isApiSuccess as <T>(response: TenantApiResponse<T>) => boolean,
});

export const useTenant = () => useTenantCore;
