/**
 * @nebula-studio/contracts/system
 *
 * 系统域权威类型定义。
 * 所有 renderer / package 必须从本模块导入，禁止在各自 shared/ 内重复声明。
 */

// ==================== 用户 ====================

export interface UserRecord {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatar?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserInput {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  realName?: string;
  status?: string;
}

// ==================== 角色 ====================

export interface RoleRecord {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string;
  status?: string;
}

// ==================== 权限 ====================

export interface PermissionNode {
  id: string;
  permName: string;
  permCode: string;
  permType?: string;
  parentId?: string | null;
  description?: string;
  sortOrder?: number;
  status?: string;
  createdAt?: string;
  children?: PermissionNode[];
}

// ==================== 组织 ====================

export interface OrganizationNode {
  id: string;
  orgName: string;
  orgCode: string;
  parentId?: string | null;
  level?: number;
  description?: string;
  status?: string;
  sortOrder?: number;
  children?: OrganizationNode[];
}

// ==================== Shell 应用 ====================

export interface ShellAppRecord {
  id: string;
  label: string;
  iconSvg?: string;
  renderer?: string;
  preload?: string;
  integratable?: number;
  defaultEnabled?: number;
  sortOrder?: number;
  status?: string;
}

// ==================== 配置 ====================

export interface ConfigItem {
  id: string;
  key: string;
  value: string;
  scope: string;
  tenantId?: string;
  group?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== 日志 ====================

export interface LogRecord {
  id?: string;
  username?: string;
  level?: string;
  module?: string;
  message?: string;
  operationType?: string;
  entityName?: string;
  createdAt?: string;
  [key: string]: unknown;
}
