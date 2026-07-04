import { authRequest, systemRequest } from '@/shared/api/client';
import type { ApiResponse, PageResult } from '@/shared/types';
import type {
  AuthMe,
  AuthMode,
  OrgPolicy,
} from '@nebula-studio/contracts/auth';
import type {
  LogRecord,
  OrganizationNode,
  PermissionNode,
  RoleRecord,
  ShellAppRecord,
  UserInput,
  UserRecord,
} from '@nebula-studio/contracts/system';

export type {
  AuthMe,
  AuthMode,
  OrgPolicy,
} from '@nebula-studio/contracts/auth';
export type {
  LogRecord,
  OrganizationNode,
  PermissionNode,
  RoleRecord,
  ShellAppRecord,
  UserInput,
  UserRecord,
} from '@nebula-studio/contracts/system';

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const usersApi = {
  page(
    params: {
      page?: number;
      size?: number;
      keyword?: string;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResult<UserRecord>>> {
    return systemRequest(`/users/page${buildQuery(params)}`);
  },

  get(id: string): Promise<ApiResponse<UserRecord>> {
    return systemRequest(`/users/${encodeURIComponent(id)}`);
  },

  create(body: UserInput): Promise<ApiResponse<UserRecord>> {
    return systemRequest('/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<UserInput>,
  ): Promise<ApiResponse<UserRecord>> {
    return systemRequest(`/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return systemRequest(`/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  updateStatus(id: string, status: string): Promise<ApiResponse<UserRecord>> {
    return systemRequest(`/users/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  resetPassword(id: string, password: string): Promise<ApiResponse<void>> {
    return systemRequest(`/users/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};

export const rolesApi = {
  list(): Promise<ApiResponse<RoleRecord[]>> {
    return systemRequest('/roles');
  },

  get(id: string): Promise<ApiResponse<RoleRecord>> {
    return systemRequest(`/roles/${encodeURIComponent(id)}`);
  },

  create(body: Partial<RoleRecord>): Promise<ApiResponse<RoleRecord>> {
    return systemRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<RoleRecord>,
  ): Promise<ApiResponse<RoleRecord>> {
    return systemRequest(`/roles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return systemRequest(`/roles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getPermissions(id: string): Promise<ApiResponse<string[]>> {
    return systemRequest(`/roles/${encodeURIComponent(id)}/permissions`);
  },

  replacePermissions(
    id: string,
    permIds: string[],
  ): Promise<ApiResponse<string[]>> {
    return systemRequest(`/roles/${encodeURIComponent(id)}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permIds }),
    });
  },
};

export const permissionsApi = {
  tree(): Promise<ApiResponse<PermissionNode[]>> {
    return systemRequest('/permissions/tree');
  },

  create(body: Partial<PermissionNode>): Promise<ApiResponse<PermissionNode>> {
    return systemRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<PermissionNode>,
  ): Promise<ApiResponse<PermissionNode>> {
    return systemRequest(`/permissions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  updateStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse<PermissionNode>> {
    return systemRequest(`/permissions/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return systemRequest(`/permissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export const organizationsApi = {
  tree(parentId?: string): Promise<ApiResponse<OrganizationNode[]>> {
    return systemRequest(
      `/organizations/tree${buildQuery({ parentId: parentId ?? undefined })}`,
    );
  },

  create(
    body: Partial<OrganizationNode>,
  ): Promise<ApiResponse<OrganizationNode>> {
    return systemRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<OrganizationNode>,
  ): Promise<ApiResponse<OrganizationNode>> {
    return systemRequest(`/organizations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return systemRequest(`/organizations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export const orgPolicyApi = {
  get(): Promise<ApiResponse<OrgPolicy>> {
    return systemRequest('/org-policy');
  },

  update(policy: OrgPolicy): Promise<ApiResponse<OrgPolicy>> {
    return systemRequest('/org-policy', {
      method: 'PUT',
      body: JSON.stringify(policy),
    });
  },
};

export const appsApi = {
  page(
    params: {
      page?: number;
      size?: number;
      keyword?: string;
      status?: string;
    } = {},
  ): Promise<ApiResponse<PageResult<ShellAppRecord>>> {
    return systemRequest(`/apps/page${buildQuery(params)}`);
  },

  create(body: Partial<ShellAppRecord>): Promise<ApiResponse<ShellAppRecord>> {
    return systemRequest('/apps', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<ShellAppRecord>,
  ): Promise<ApiResponse<ShellAppRecord>> {
    return systemRequest(`/apps/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return systemRequest(`/apps/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  updateStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse<ShellAppRecord>> {
    return systemRequest(`/apps/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export const logsApi = {
  loginPage(
    params: {
      page?: number;
      size?: number;
      username?: string;
      startTime?: string;
      endTime?: string;
    } = {},
  ): Promise<ApiResponse<PageResult<LogRecord>>> {
    return systemRequest(`/logs/login/page${buildQuery(params)}`);
  },

  operationsPage(
    params: {
      page?: number;
      size?: number;
      level?: string;
      module?: string;
      startTime?: string;
      endTime?: string;
    } = {},
  ): Promise<ApiResponse<PageResult<LogRecord>>> {
    return systemRequest(`/logs/operations/page${buildQuery(params)}`);
  },

  auditPage(
    params: {
      page?: number;
      size?: number;
      operationType?: string;
      entityName?: string;
      startTime?: string;
      endTime?: string;
    } = {},
  ): Promise<ApiResponse<PageResult<LogRecord>>> {
    return systemRequest(`/logs/audit/page${buildQuery(params)}`);
  },
};

export const authApi = {
  mode(): Promise<ApiResponse<AuthMode>> {
    return authRequest('/mode');
  },

  me(): Promise<ApiResponse<AuthMe>> {
    return authRequest('/me');
  },
};
