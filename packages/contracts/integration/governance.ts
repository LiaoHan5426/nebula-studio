/**
 * @nebula-studio/contracts/integration — 发布治理域
 */

/** 发布状态（对齐后端 ReleaseStatus 枚举） */
export enum PublishStatus {
  DRAFT = 'DRAFT',
  VERSIONED = 'VERSIONED',
  APPROVED = 'APPROVED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  ROLLED_BACK = 'ROLLED_BACK',
}

/** 治理申请状态（对齐后端 GovernanceStatus 枚举） */
export enum GovernanceStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** 治理申请类型 */
export enum RequestKind {
  CREATE = 'CREATE',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
}

export interface GovernanceRequest {
  requestId: string;
  resourceId: string;
  resourceType: string;
  kind: RequestKind;
  status: GovernanceStatus;
  tenantId?: string;
  applicantId: string;
  reason?: string;
  releaseId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface GovernanceApprovalRequest {
  resourceId: string;
  resourceType: string;
  kind?: RequestKind;
  description?: string;
  tenantId?: string;
  applicantId?: string;
}

export interface GovernanceApprovalDecision {
  requestId: string;
  decision: 'APPROVED' | 'REJECTED';
  approverId: string;
  comment?: string;
}

/** 版本快照（对齐后端 VersionSnapshot DTO） */
export interface VersionSnapshot {
  versionId: string;
  resourceId: string;
  label: string;
  snapshotJson: string;
  createdAt: string;
  createdBy: string;
}

/** 版本差异结果 */
export interface VersionDiff {
  leftVersionId: string;
  rightVersionId: string;
  diffSummary: string;
  identical: boolean;
}

/** 发布记录（对齐后端 Release DTO） */
export interface ReleaseRecord {
  releaseId: string;
  resourceId: string;
  versionId?: string;
  status: PublishStatus;
  tenantId?: string;
  createdBy?: string;
  createdAt: string;
  deployedAt?: string;
}

export enum GovernancePolicyType {
  RATE_LIMIT = 'RATE_LIMIT',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  WHITELIST = 'WHITELIST',
  BLACKLIST = 'BLACKLIST',
}

export interface GovernancePolicy {
  policyId: string;
  resourceId: string;
  policyType: GovernancePolicyType;
  config: Record<string, unknown>;
  enabled: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
