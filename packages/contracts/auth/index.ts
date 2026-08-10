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
  orgCode: string;
  orgName: string;
  primary?: boolean;
}

export interface OrgPolicy {
  enabled: boolean;
  multiOrgEnabled: boolean;
}

// ==================== 认证模式 ====================

export interface AuthMode {
  authType: string;
  multiOrgEnabled: boolean;
  orgEnabled: boolean;
}

// ==================== 当前用户 ====================

export interface AuthMe {
  currentOrgCode?: string;
  currentOrgId?: string;
  currentOrgName?: string;
  organizations?: OrgSummary[];
  roles: string[];
  userId: number | string;
  username: string;
}

// ==================== 登录 / 组织切换 ====================

export interface AuthLoginRequest {
  password: string;
  username: string;
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
  currentOrgId?: string;
  currentOrgName?: string;
  needsOrgSelection?: boolean;
  organizations?: OrgSummary[];
  roles?: string[];
  token?: string;
  userId?: number | string;
  username: string;
}

export interface SwitchOrgResult {
  currentOrgCode?: string;
  currentOrgId?: string;
  currentOrgName?: string;
  token?: string;
}

// ==================== 集成域登录（integration renderer 专用） ====================

export interface IntegrationLoginResult {
  roles?: string[];
  token: string;
  userId: number;
  username: string;
}

export interface AuthProfile {
  roles: string[];
  userId: number;
  username: string;
}

// ==================== Electron IPC ====================

export interface ElectronAuthSession {
  roles?: string[];
  token?: string;
  user: string;
  userId?: string;
}

export interface ElectronAuthLoginPayload {
  password: string;
  user: string;
}

export type ElectronAuthLoginResult =
  | (ElectronAuthSession & { ok: true })
  | { error: string; ok: false };

export interface ElectronAuthEstablishSessionPayload extends ElectronAuthSession {
  token: string;
}

export interface ElectronAuthApi {
  establishSession(
    payload: ElectronAuthEstablishSessionPayload,
  ): Promise<boolean>;
  getSession(): Promise<ElectronAuthSession | null>;
  login(payload: ElectronAuthLoginPayload): Promise<ElectronAuthLoginResult>;
  logout(): Promise<boolean | void>;
}
