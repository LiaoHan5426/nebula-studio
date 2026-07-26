/**
 * @nebula-studio/contracts/auth
 *
 * 认证域权威类型定义。
 * 所有 renderer / package 必须从本模块导入，禁止在各自 shared/ 内重复声明。
 */

import type { ApiResponse } from '../common/index.ts';

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

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthCompleteLoginRequest {
  orgId: string;
}

/**
 * 认证接口失败时可能没有 data，因此不能直接使用 data 必填的 ApiResponse。
 */
export type AuthApiResponse<T> = Omit<ApiResponse<T>, 'data'> & {
  data?: T;
};

export interface BackendLoginResult {
  token?: string;
  username: string;
  userId?: string | number;
  roles?: string[];
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

// ==================== Electron IPC ====================

export interface ElectronAuthSession {
  user: string;
  token?: string;
  roles?: string[];
  userId?: string;
}

export interface ElectronAuthLoginPayload {
  user: string;
  password: string;
}

export type ElectronAuthLoginResult =
  | ({ ok: true } & ElectronAuthSession)
  | { ok: false; error: string };

export interface ElectronAuthEstablishSessionPayload extends ElectronAuthSession {
  token: string;
}

export interface ElectronAuthApi {
  login(payload: ElectronAuthLoginPayload): Promise<ElectronAuthLoginResult>;
  getSession(): Promise<ElectronAuthSession | null>;
  establishSession(
    payload: ElectronAuthEstablishSessionPayload,
  ): Promise<boolean>;
  logout(): Promise<boolean | void>;
}
