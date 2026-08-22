import type { PageResult } from '@nebula-studio/contracts/common';
import type { UserRecord } from '@nebula-studio/contracts/system';

import type { ApiResponse } from '@/shared/types';

import { systemRequest } from '@/shared/api/client';

export const tenantUsersApi = {
  listForBinding(): Promise<ApiResponse<PageResult<UserRecord>>> {
    return systemRequest('/users/page?page=1&size=100&status=ACTIVE');
  },
};
