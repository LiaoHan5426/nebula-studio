/**
 * @nebula-studio/contracts/system
 *
 * 系统域权威类型定义。
 * 所有 renderer / package 必须从本模块导入，禁止在各自 shared/ 内重复声明。
 */

// ==================== 用户 ====================

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

// ==================== 角色 ====================

export interface RoleRecord {
  description?: string;
  id: string;
  roleCode: string;
  roleName: string;
  status?: string;
}

// ==================== 权限 ====================

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

// ==================== 组织 ====================

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

// ==================== Shell 应用 ====================

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

// ==================== 配置 ====================

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

// ==================== 日志 ====================

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
