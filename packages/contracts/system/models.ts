/**
 * System domain models — stable app-facing shapes.
 * Wire types originate from `@nebula-studio/contracts/generated` (see mappers.ts).
 */

export interface UserRecord {
  avatar?: string;
  createdAt?: string;
  email?: string;
  id: string;
  lastLoginAt?: string;
  phone?: string;
  realName?: string;
  status?: string;
  updatedAt?: string;
  username: string;
}

export interface UserInput {
  email?: string;
  password?: string;
  phone?: string;
  realName?: string;
  status?: string;
  username: string;
}

export interface RoleRecord {
  description?: string;
  id: string;
  roleCode: string;
  roleName: string;
  status?: string;
}

export interface PermissionNode {
  children?: PermissionNode[];
  createdAt?: string;
  description?: string;
  id: string;
  parentId?: null | string;
  permCode: string;
  permName: string;
  permType?: string;
  sortOrder?: number;
  status?: string;
}

export interface OrganizationNode {
  children?: OrganizationNode[];
  description?: string;
  id: string;
  level?: number;
  orgCode: string;
  orgName: string;
  parentId?: null | string;
  sortOrder?: number;
  status?: string;
}

export interface ShellAppRecord {
  defaultEnabled?: number;
  iconSvg?: string;
  id: string;
  integratable?: number;
  label: string;
  preload?: string;
  renderer?: string;
  sortOrder?: number;
  status?: string;
}

export interface ConfigItem {
  createdAt?: string;
  defaultValue?: string;
  group?: string;
  id: string;
  impactScope?: string;
  inheritedFrom?: string;
  inheritedValue?: string;
  key: string;
  schema?: {
    description?: string;
    enum?: string[];
    restartRequired?: boolean;
    sensitive?: boolean;
    type?: 'boolean' | 'json' | 'number' | 'string';
  };
  scope: string;
  sensitive?: boolean;
  tenantId?: string;
  type?: string;
  updatedAt?: string;
  value: string;
}

export interface LogRecord {
  [key: string]: unknown;
  createdAt?: string;
  entityName?: string;
  id?: string;
  level?: string;
  message?: string;
  module?: string;
  operationType?: string;
  username?: string;
}
