/**
 * @nebula-studio/contracts/auth
 *
 * 认证域权威类型定义。
 * 所有 renderer / package 必须从本模块导入，禁止在各自 shared/ 内重复声明。
 */

// ==================== 组织 ====================

export interface OrgSummary {
  id: string;
  orgName: string;
  orgCode: string;
  primary?: boolean;
}

export interface OrgPolicy {
  enabled: boolean;
  multiOrgEnabled: boolean;
}

// ==================== 认证模式 ====================

export interface AuthMode {
  authType: string;
  orgEnabled: boolean;
  multiOrgEnabled: boolean;
}

// ==================== 当前用户 ====================

export interface AuthMe {
  username: string;
  userId: string | number;
  roles: string[];
  currentOrgId?: string;
  currentOrgCode?: string;
  currentOrgName?: string;
  organizations?: OrgSummary[];
}

// ==================== 登录 / 组织切换 ====================

export interface BackendLoginResult {
  token?: string;
  username: string;
  needsOrgSelection?: boolean;
  organizations?: OrgSummary[];
  currentOrgId?: string;
  currentOrgName?: string;
}

export interface SwitchOrgResult {
  token?: string;
  currentOrgId?: string;
  currentOrgCode?: string;
  currentOrgName?: string;
}

// ==================== 集成域登录（integration renderer 专用） ====================

export interface IntegrationLoginResult {
  token: string;
  username: string;
  userId: number;
  roles?: string[];
}

export interface AuthProfile {
  username: string;
  userId: number;
  roles: string[];
}
