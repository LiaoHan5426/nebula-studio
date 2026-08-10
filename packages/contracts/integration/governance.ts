/**
 * @nebula-studio/contracts/integration — 发布治理域
 */

/** 发布状态（对齐后端 ReleaseStatus 枚举） */
export enum PublishStatus {
  APPROVED = 'APPROVED',
  DEPLOYED = 'DEPLOYED',
  DEPLOYING = 'DEPLOYING',
  DRAFT = 'DRAFT',
  ROLLED_BACK = 'ROLLED_BACK',
  VERSIONED = 'VERSIONED',
}

/** 治理申请状态（对齐后端 GovernanceStatus 枚举） */
export enum GovernanceStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  REVIEWING = 'REVIEWING',
}

/** 治理申请类型 */
export enum RequestKind {
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  MODIFY = 'MODIFY',
  PUBLISH = 'PUBLISH',
}

export interface GovernanceRequest {
  applicantId: string;
  createdAt: string;
  kind: RequestKind;
  payload?: Record<string, unknown>;
  reason?: string;
  releaseId?: string;
  requestId: string;
  resourceId: string;
  resourceType: string;
  status: GovernanceStatus;
  tenantId?: string;
  updatedAt?: string;
}

export interface GovernanceApprovalRequest {
  applicantId?: string;
  description?: string;
  kind?: RequestKind;
  resourceId: string;
  resourceType: string;
  tenantId?: string;
}

export interface GovernanceApprovalDecision {
  approverId: string;
  comment?: string;
  decision: 'APPROVED' | 'REJECTED';
  requestId: string;
}

/** 版本快照（对齐后端 VersionSnapshot DTO） */
export interface VersionSnapshot {
  createdAt: string;
  createdBy: string;
  label: string;
  resourceId: string;
  snapshotJson: string;
  versionId: string;
}

/** 版本差异结果 */
export interface VersionDiff {
  diffSummary: string;
  identical: boolean;
  leftVersionId: string;
  rightVersionId: string;
}

/** 发布记录（对齐后端 Release DTO） */
export interface ReleaseRecord {
  createdAt: string;
  createdBy?: string;
  deployedAt?: string;
  releaseId: string;
  resourceId: string;
  status: PublishStatus;
  tenantId?: string;
  versionId?: string;
}

export enum GovernancePolicyType {
  BLACKLIST = 'BLACKLIST',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  RATE_LIMIT = 'RATE_LIMIT',
  WHITELIST = 'WHITELIST',
}

export interface GovernancePolicy {
  config: Record<string, unknown>;
  createdAt: string;
  enabled: boolean;
  policyId: string;
  policyType: GovernancePolicyType;
  resourceId: string;
  tenantId: string;
  updatedAt: string;
}
